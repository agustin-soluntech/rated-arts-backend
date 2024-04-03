import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Products } from "./Products.js";

/* This code snippet is defining a Sequelize model for artists in a database. It is creating a table
named "artists" with columns for "id" and "full_name". The "id" column is defined as a BIGINT type,
acting as the primary key with auto-increment enabled. The "full_name" column is defined as a STRING
type and is set to not allow null values. This model definition allows you to interact with the
"artists" table in the database using Sequelize ORM methods such as creating, updating, deleting,
and querying artist records. */
export const Artists = sequelize.define("artists", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
