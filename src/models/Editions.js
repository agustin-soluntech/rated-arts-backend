import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'

export const Editions = sequelize.define('editions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    display: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    frames: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})
