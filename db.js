const {Sequelize} = require("sequelize")

module.exports = new Sequelize(
    "telega_botDB",
    "root",
    "root",
    {
        host: "master.0643b26b-5ea3-4727-bcd9-21c0843310d6.c.dbaas.selcloud.ru",
        port: "5432",
        dialect: "postgres"
    }
)