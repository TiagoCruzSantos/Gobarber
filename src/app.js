const express = require('express')
require('express-async-errors')
const routes = require('./routes')
const path = require('path')
const Sentry = require('@sentry/node')
const sentryConfit = require('./config/sentry')
const Youch = require('youch')
require('./database')

class App {
    constructor() {
        this.server = express()

        Sentry.init(sentryConfit)

        this.middlewares()
        this.routes()
        this.exeptionHandler()
    }

    middlewares(){
        this.server.use(Sentry.Handlers.requestHandler())
        this.server.use(express.json())
        this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
    }
    routes(){
        this.server.use(routes)
        this.server.use(Sentry.Handlers.errorHandler())
    }
    exeptionHandler(){
        this.server.use(async (err, req, res, next) => {
            const errors = await new Youch(err, req).toJSON()

            return res.status(500).json(errors)
        })
    }
}

module.exports = new App().server