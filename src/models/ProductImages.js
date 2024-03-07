import {DataTypes} from 'sequelize';
import {sequelize} from '../database/database.js';
import { Sizes } from './Sizes.js';

export const ProductImages = sequelize.define('product_images', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    size_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
});

ProductImages.belongsTo(Sizes, { as: 'Size', foreignKey: 'size_id' });