const Sequelize = require('sequelize')
const Model = Sequelize.Model

class File extends Model {
    static init(sequelize){
        super.init({
            name: Sequelize.STRING,
            path: Sequelize.STRING,
            url: {
                type: Sequelize.VIRTUAL,
                get(){
                    return `http://localhost:8080/files/${this.path}`
                }
            }
        },
        {
            sequelize
        })

        return this
    }
}

module.exports = File