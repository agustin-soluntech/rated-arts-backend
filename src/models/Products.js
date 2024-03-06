import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'
import { Size } from './Size.js';
import { Editions } from './Editions.js';
import { Artist } from './Artist.js';
import { Variants } from './Variants.js';


export const Products = sequelize.define('products', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    artist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

Products.belongsToMany(Size, { through: 'ProductSize' });
Size.belongsToMany(Products, { through: 'ProductSize' });

Products.belongsToMany(Editions, { through: 'ProductEdition' });
Editions.belongsToMany(Products, { through: 'ProductEdition' });


Products.belongsTo(Artist, { as: 'Artist' });
Artist.hasOne(Products, { as: 'Product' });

Products.hasMany(Variants, { as: 'Variants' });