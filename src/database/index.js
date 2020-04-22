const Sequelize = require('sequelize')
const User = require('../app/models/User')
const File = require('../app/models/File')
const Appointment = require('../app/models/Appointment')
const Notification = require('../app/models/Notification')
const databaseConfig = require('../config/database')

const models = [User, File, Appointment, Notification]

class Database {
    constructor(){
        this.init()
    }

    init(){
        this.connection = new Sequelize(databaseConfig.url, databaseConfig)
        models.map(model => model.init(this.connection)).map(model => model.associate && model.associate(this.connection.models))
    }
}

module.exports = new Database()