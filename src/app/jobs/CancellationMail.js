const Mail = require('../../lib/Mail')

class CancelationMail{
    get key(){
        return 'CancellationMail'
    }

    async handle({data}){
        const {appointment} = data
        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancellation',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: appointment.date
            }
        })
    }
}

module.exports = new CancelationMail()