const User = require('../models/User')
const Yup = require('yup')

class UserController {
    async store(req, res){
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6)
        })
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: "Validation failed"})
        }

        const userExists = await User.findOne({where: {email: req.body.email}})
        if(userExists){
            return res.status(400).json({error: "E-mail in use"})
        }
        if(req.body.password){
            const user = await User.create(req.body)
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                provider: user.provider
            });
        }else{
            return res.status(400).json({error: 'Password not provided'})
        }
    }

    async update(req, res){
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            password: Yup.string().min(6),
            oldPassword: Yup.string().min(6).when('password', (password, field) => 
                (password ? field.required() : field)
            ),
            confirmPassword: Yup.string().when('password', (password, field) => 
                (password ? field.required().oneOf([Yup.ref('password')]) : field)
            )
        })
        
        try{
            await schema.validate(req.body)
        }catch(e){
            return res.status(400).json({
                error: 'Validation failed',
                errors: e.errors
            })
        }

        const {email, oldPassword, password} = req.body

        const user = await User.findByPk(req.userId)

        if(email && email != user.email){
            const userExists = await User.findOne({where: {email}})
            if(userExists){
                return res.status(400).json({error: "E-mail in use"})
            }
        }

        if(oldPassword && password && !( await user.checkPassword(oldPassword))){
            return res.status(401).json({error: 'Password does not match'})
        }

        const {id, name, provider} = await user.update(req.body)

        return res.json({
            id,
            name,
            email,
            provider
        })
    }
}

module.exports = new UserController()