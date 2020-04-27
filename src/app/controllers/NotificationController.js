const User = require('../models/User')
const Notification = require('../models/Notification')
const Appointment = require('../models/Appointment')
class NotificationController{
    async index(req, res){

        const provider = await User.findOne({
            where: {
                id: req.userId,
                provider: true
            }
        })

        if(!provider){
            return res.status(401).json({error: 'User must be a provider'})
        }

        const notifications = await Notification.findAll({
            include: [{
                model: Appointment,
                as: 'appointment',
                attributes: ['id','date'],
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id','name']
                }]
            }],
            attributes: ['id','content'],
            where: {
                user_id: req.userId
            },
            order: [['created_at', 'DESC']],
            limit: 20
        })

        return res.json(notifications)
    }
}

module.exports = new NotificationController()