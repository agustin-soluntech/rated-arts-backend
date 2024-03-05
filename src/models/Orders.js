import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'
import { LineItems } from './LineItems.js';
import { Customers } from './Customers.js';

export const Orders = sequelize.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

Orders.hasMany(LineItems, { as: 'LineItems' });
Orders.belongsTo(Customers, { as: 'Customer' });
