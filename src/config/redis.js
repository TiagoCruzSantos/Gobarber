require('dotenv/config')
module.exports = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
}