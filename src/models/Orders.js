import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { LineItems } from "./LineItems.js";
import { Customers } from "./Customers.js";

/* This block of code is defining a Sequelize model for the "orders" table in a database. Let me break
it down for you: */
export const Orders = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    order_number: {
      type: DataTypes.STRING,
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
    artist_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { timestamps: false }
);

Orders.belongsTo(Customers, { as: "Customer", foreignKey: "customer_id" });

Customers.hasMany(Orders, { as: "Orders", foreignKey: "customer_id" });
