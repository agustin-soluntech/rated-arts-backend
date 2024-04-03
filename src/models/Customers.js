import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Orders } from "./Orders.js";

/* This code snippet is defining a Sequelize model for a table named "customers" in the database. The
model specifies the structure of the "customers" table with various columns such as id, first_name,
last_name, email, phone, address, city, province, zip, and country. Each column has a specified data
type and constraints like allowNull and primaryKey. */
export const Customers = sequelize.define("customers", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
