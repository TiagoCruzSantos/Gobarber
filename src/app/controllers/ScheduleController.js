const {startOfDay, endOfDay, parseISO} = require('date-fns')
const { Op } = require('sequelize')
const Appointment = require('../models/Appointment')
const User = require('../models/User')
const File = require('../models/File')

class ScheduleController{
    async index(req, res){
        const provider = await User.findOne({
            where: {
                id: req.userId,
                provider: true
            }
        })

        if(!provider){
            return res.status(401).json({error: 'User is not a provider'})
        }

        const { date } = req.query
        const parsedDate = parseISO(date)

        const appointments = await Appointment.findAll({
            where:{
                provider_id: req.userId,
                canceled_at: null,
                date:{
                    [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
                }
            },
            order: ['date'],
            attributes: ['id', 'date'],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name'],
                include: [{
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'path', 'url']
                }] 
            }]
            
        })

        return res.json(appointments)
    }
}

module.exports = new ScheduleController()