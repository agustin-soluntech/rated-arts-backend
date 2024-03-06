import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'
import { Products } from './Products.js';

export const Variants = sequelize.define('variants', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    option1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    option2: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    option3: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    inventory_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    edition_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    size_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});
