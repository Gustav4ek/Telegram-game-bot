const TelegramBot = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require("./options")
const botApi = "6386240481:AAE6D1AxHzwusqApQ-g6TnXABjaWuPX_pUw"
const sequelize = require("./db")
const UserModel = require("./models")
const {where} = require("sequelize");
const bot = new TelegramBot(botApi, {polling: true});

const chats = {};


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, "Сейчас я загадаю цифру от 0 до 9 а ты должен ее угадать")
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    return bot.sendMessage(chatId, "Отгадывай", gameOptions)
}
const start = async () =>  {

    try {
        await sequelize.authenticate();
        await sequelize.sync();

    } catch (e) {
        console.log("Ошибка подключения к БД", e)
    }

    bot.setMyCommands([
        {command: "/start", description: "Приветствие"},
        {command: "/info", description: "Информация о пользователе"},
        {command: "/game", description: "Начать игру"},
        {command: "rating", description: "Рейтинг пользователей"}
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const username = msg.from.username;
        console.log(username);

        try{
            if (text === "/start") {
                await UserModel.create({chatId: chatId, username: username});
                return  bot.sendSticker(chatId, "https://tlgrm.eu/_/stickers/b0d/85f/b0d85fbf-de1b-4aaf-836c-1cddaa16e002/192/3.webp")
            }

            if (text === "/info") {
                const user = await UserModel.findOne({ where: { chatId: String(chatId) } })
                console.log(user)
                return  bot.sendMessage(chatId, `В игре у тебя ${user.right} правильных ответов и ${user.wrong} ошибочных, процент попадания ${Number((user.right/user.wrong)).toFixed(1)}%`)
            }

            if (text === "/rating") {
                let pos = 1;
                const users = await UserModel.findAll({ order: [["right", "DESC"]] });
                await bot.sendMessage(chatId, "Рейтинг игроков:");
                for (const [index, user] of users.entries()) {
                    await bot.sendMessage(chatId, ` ${index + 1}. ${user.username}: ${user.right}`);
                }
                return;
            }

            if (text === "/game") {
                return startGame(chatId);

            }
            return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз")
        } catch (e) {
            console.log(e)
            return bot.sendMessage(chatId, "Произошла непредвиденная ошибка, напиши мне если увидел данное сообщение")
        }

    })

    bot.on("callback_query", async msg=>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        console.log(msg.from.username);
        try {
            if (data === "/again") {
                return startGame(chatId);
            }
            const user = await UserModel.findOne({ where: { chatId: String(chatId) } })
            if (parseInt(data) === chats[chatId]) {
                user.right++;
                await bot.sendMessage(chatId, "Поздравляю, ты угадал цифру!", againOptions)
            } else {
                user.wrong++;
                await bot.sendMessage(chatId, `К сожалению, загаданное число было ${chats[chatId]}`, againOptions);
            }
            await user.save();
        } catch (e) {
            console.error("Ошибка при обработке callback_query:", e);
            await bot.sendMessage(chatId, "Произошла ошибка при обработке запроса.");
        }

    })

}

start();