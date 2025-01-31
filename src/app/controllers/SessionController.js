const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')
const Yup = require('yup')
const User = require('../models/User')

class SessionController {
    async store(req, res){
        const schema = Yup.object().shape({
            email: Yup.string().email().required(),
            password: Yup.string().required()
        })
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Validation failed"})
        }

        const { email, password} = req.body

        const user = await User.findOne({where: {email}})

        if(!user){
            return res.status(401).json({error: 'User not found'})
        }

        if(!(await user.checkPassword(password))){
            return res.status(401).json({error: "Password doesn't match"})
        }

        const {id, name} = user

        return res.json({
            user: {
                id,
                name,
                email
            },
            token: jwt.sign({ id },authConfig.secret , {
                expiresIn: authConfig.expiresIn
            })
        })
    }
}

module.exports = new SessionController()