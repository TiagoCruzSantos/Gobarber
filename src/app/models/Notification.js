const Sequelize = require('sequelize')
const Appointment = require('./Appointment')
const User = require('./User')

class Notification extends Sequelize.Model{
    static init(sequelize){
        super.init({
            read: Sequelize.BOOLEAN
        }, {
            sequelize
        })

        return this
    }

    static associate(models){
        this.belongsTo(User, {foreignKey: 'user_id', as: 'user'})
        this.belongsTo(Appointment, {foreignKey: 'appointment_id', as: 'appointment'})
    }
}

module.exports = Notification