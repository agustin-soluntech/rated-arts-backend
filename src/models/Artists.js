import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'
import { Products } from './Products.js'

export const Artists = sequelize.define('artists', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})