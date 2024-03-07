import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Variants } from "./Variants.js";
import { Products } from "./Products.js";

export const Editions = sequelize.define(
  "editions",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    display: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

Variants.belongsTo(Editions, { as: "Edition", foreignKey: "edition_id" });
Editions.belongsToMany(Products, { through: "ProductEdition" });
Editions.hasMany(Variants, { as: "Variants", foreignKey: "edition_id" });

Products.belongsToMany(Editions, { through: "ProductEdition" });
