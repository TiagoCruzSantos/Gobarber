const Appointment = require("../models/Appointment")
const User = require('../models/User')
const File = require('../models/File')
const Notification = require('../models/Notification')
const {startOfHour, parseISO, isBefore, subHours} = require('date-fns')
const Yup = require('yup')

const CancellationMail = require('../jobs/CancellationMail')
const Queue = require('../../lib/Queue')

class AppointmentController{
    async index(req, res){
        const {page = 1} = req.query

        const appointments = await Appointment.findAll({
            where: {
                user_id: req.userId,
                canceled_at: null
            },
            order: ['date'],
            attributes: ['id', 'date', 'past', 'cancelable'],
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

    async delete(req, res){
        if(!req.params.id){
            return res.status(400).json({error: "There is no appointment id in the request"})
        }

        const appointment = await Appointment.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'provider',
                attributes: ['name', 'email']
            },{
                model: User,
                as: 'user',
                attributes: ['name']
            }]
        })

        if(appointment.user_id !== req.userId){
            return res.status(401).json({error: 'You do not have permission to cancel this appointment'})
        }

        const dateWithSub = subHours(appointment.date, 2)

        if(isBefore(dateWithSub, new Date())){
            return res.status(401).json({error: "You can only cancel appointments 2 hours in advance"})
        }

        appointment.canceled_at = new Date()

        await appointment.save()

        await Queue.add(CancellationMail.key, {
            appointment
        })

        return res.json(appointment)
    }
}

module.exports = new AppointmentController()