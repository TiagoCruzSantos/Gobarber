const Sequelize = require('sequelize')
const Appointment = require('./Appointment')
const User = require('./User')

class Notification extends Sequelize.Model{
    static init(sequelize){
        super.init({
            read: Sequelize.BOOLEAN,
            content: {
                type: Sequelize.VIRTUAL,
                get(){
                    return `Você tem uma notificação de ${this.appointment.user.name} para ${this.appointment.date}`
                }
            }
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