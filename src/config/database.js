if(process.env.NODE_ENV !== 'production'){
    require('dotenv/config')
}
module.exports = {
    dialect: 'postgres',
    url: process.env.DB_URL,
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
    }
}