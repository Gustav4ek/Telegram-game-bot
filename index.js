const TelegramBot = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require("./options")
const botApi = "6386240481:AAE6D1AxHzwusqApQ-g6TnXABjaWuPX_pUw"

const bot = new TelegramBot(botApi, {polling: true});

const chats = {};


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, "Сейчас я загадаю цифру от 0 до 9 а ты должен ее угадать")
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    return bot.sendMessage(chatId, "Отгадывай", gameOptions)
}
const start = () =>  {
    bot.setMyCommands([
        {command: "/start", description: "Приветствие"},
        {command: "/info", description: "Информация о пользователе"},
        {command: "/game", description: "Начать игру"}
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === "/start") {
            return  bot.sendSticker(chatId, "https://tlgrm.eu/_/stickers/b0d/85f/b0d85fbf-de1b-4aaf-836c-1cddaa16e002/192/3.webp")
        }

        if (text === "/info") {
            return  bot.sendMessage(chatId, `Тебя зовут ${msg.from.username}`)
        }

        if (text === "/game") {
            return startGame(chatId);

        }
        return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз")
    })

    bot.on("callback_query", async msg=>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === "/again") {
            return startGame(chatId);
        }
        if (data == chats[chatId]) {
            return await bot.sendMessage(chatId, "Поздравляю, ты угадал цифру!", againOptions)
        } else
        return await bot.sendMessage(chatId, `К сожалению, загаданное число было ${chats[chatId]}`, againOptions);
    })
}

start();