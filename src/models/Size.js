import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'

export const Size = sequelize.define('size', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    display: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    widht: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    height: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})
