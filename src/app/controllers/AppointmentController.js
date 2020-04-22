const Appointment = require("../models/Appointment")
const User = require('../models/User')
const File = require('../models/File')
const Notification = require('../models/Notification')
const {startOfHour, parseISO, isBefore} = require('date-fns')
const Yup = require('yup')

class AppointmentController{
    async index(req, res){
        const {page = 1} = req.query

        const appointments = await Appointment.findAll({
            where: {
                user_id: req.userId,
                canceled_at: null
            },
            order: ['date'],
            attributes: ['id', 'date'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [{
                model: User,
                as: 'provider',
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

    async store(req, res){
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required()
        })
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: 'Validation failed'})
        }

        const {provider_id, date} = req.body

        const provider = await User.findOne({
            where: {
                id: provider_id,
                provider: true
            }
        })

        if(!provider){
            return res.status(401).json({error: 'provider_id must be a provider'})
        }

        const hourStart = startOfHour(parseISO(date))

        if(isBefore(hourStart, new Date())){
            return res.status(401).json({error: "Can't set appointments in the past"})
        }

        const checkExistingAppointment = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart
            }
        })

        if(checkExistingAppointment){
            return res.status(400).json({error: 'This provider aready has an appointment at this time'})
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date: hourStart
        })

        const notification = await Notification.create({
            appointment_id: appointment.id,
            user_id: provider.id
        })

        return res.json(appointment)
    }
}

module.exports = new AppointmentController()