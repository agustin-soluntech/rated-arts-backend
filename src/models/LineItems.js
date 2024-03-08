import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Orders } from "./Orders.js";
import { Products } from "./Products.js";
import { Variants } from "./Variants.js";

export const LineItems = sequelize.define("line_items", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  variant_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frames: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resizedImageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

LineItems.belongsTo(Orders, { as: "Order", foreignKey: "order_id" });

Orders.hasMany(LineItems, { as: "LineItems", foreignKey: "order_id" });
