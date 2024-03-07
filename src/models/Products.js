import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Sizes } from "./Sizes.js";
import { Artists } from "./Artists.js";
import { LineItems } from "./LineItems.js";
import { ProductImages } from "./ProductImages.js";

export const Products = sequelize.define("products", {
  id: {
    type: DataTypes.BIGINT,
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
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  artist_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
});

Products.belongsToMany(Sizes, { through: "ProductSize" });
Sizes.belongsToMany(Products, { through: "ProductSize" });

Products.belongsTo(Artists, { as: "Artist", foreignKey: "artist_id"});

Products.hasMany(LineItems, { as: "LineItems", foreignKey: "product_id" });
Products.hasMany(ProductImages, {
  as: "ProductImages",
  foreignKey: "product_id",
});

Artists.hasMany(Products, { as: "Products", foreignKey: "artist_id" });

LineItems.belongsTo(Products, { as: "Product", foreignKey: "product_id" });
ProductImages.belongsTo(Products, { as: "Product", foreignKey: "product_id" });
