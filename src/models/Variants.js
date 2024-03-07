import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Products } from "./Products.js";
import { Sizes } from "./Sizes.js";
import { LineItems } from "./LineItems.js";

export const Variants = sequelize.define(
  "variants",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    size_id: {
      type: DataTypes.BIGINT,
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
  },
  {
    timestamps: false,
  }
);

Variants.belongsTo(Products, { as: "Product", foreignKey: "product_id" });
Variants.belongsTo(Sizes, { as: "Size", foreignKey: "size_id" });

Variants.hasMany(LineItems, { as: "LineItems", foreignKey: "variant_id" });

Products.hasMany(Variants, { as: "Variants", foreignKey: "product_id" });
Sizes.hasMany(Variants, { as: "Variants", foreignKey: "size_id" });

LineItems.belongsTo(Variants, { as: "Variant", foreignKey: "variant_id" });
