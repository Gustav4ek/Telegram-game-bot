const {Sequelize} = require("sequelize")

module.exports = new Sequelize(
    "telega_botDB",
    "root",
    "root",
    {
        host: "master.05e5be54-0ee5-4ae1-bddf-3ee5af15920b.c.dbaas.selcloud.ru",
        port: "5432",
        dialect: "postgres"
    }
)