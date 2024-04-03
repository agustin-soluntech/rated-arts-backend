import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

/* This code snippet is defining a Sequelize model named `Sizes` that represents a table in a database.
Here's a breakdown of what each part of the code is doing: */
export const Sizes = sequelize.define(
  "sizes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    display: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    picsart_width: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);
