import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'

export const ProductImages = sequelize.define('product_images', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    size_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});