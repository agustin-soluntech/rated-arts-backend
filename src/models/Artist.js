import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'

export const Artist = sequelize.define('artist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

//TODO: add users relationship