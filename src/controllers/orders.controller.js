import { sequelize } from "../database/database.js";
import { Customers } from "../models/Customers.js";
import { LineItems } from "../models/LineItems.js";
import { Orders } from "../models/Orders.js";
import { getProductById } from "../utils/shopify.js";
import { createProductAndVariants, findMissingProducts } from "./products.controller.js";

export const getOrders = async (req, res) => {
  const limit = req.query.limit;
  const offset = req.query.offset;
  try {
    const orders = await Orders.findAll({
      include: [
        {
          model: LineItems,
          as: "LineItems",
        },
        {
          model: Customers,
          as: "Customer",
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Orders.findByPk(req.params.id, {
      include: [
        {
          model: LineItems,
          as: "LineItems",
        },
        {
          model: Customers,
          as: "Customer",
        },
      ],
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const orderData = req.body;
  try {
    const transaction = await sequelize.transaction(async (transaction) => {
      const missingProducts = await findMissingProducts([... new Set(orderData.line_items.map((lineItem) => lineItem.product_id))]);
      if (missingProducts.length > 0) {
        for(let productId of missingProducts) {
          const product = getProductById(productId);
          await createProductAndVariants(product, transaction, null, null);
        }
      }
      const customer = await Customers.create(
        {
          id: orderData.customer.id,
          first_name: orderData.billing_address.first_name ?? "",
          last_name: orderData.billing_address.last_name ?? "",
          name: orderData.billing_address.name ?? "",
          email: orderData.customer.email ?? "",
          phone: orderData.billing_address.phone ?? "",
          address: orderData.billing_address.address1 ?? "",
          city: orderData.billing_address.city ?? "",
          province: orderData.billing_address.province ?? "",
          zip: orderData.billing_address.zip ?? "",
          country: orderData.billing_address.country ?? "",
        },
        { transaction }
      );
      const order = await Orders.create(
        {
          id: orderData.id,
          order_number: orderData.order_number,
          total: orderData.total_price,
          currency: orderData.currency,
          customer_id: customer.id,
          created_at: orderData.created_at,
        },
        { transaction }
      );

      const lineItems = orderData.line_items.map((lineItem) => {
        return {
          id: lineItem.id,
          name: lineItem.name,
          order_id: order.id,
          product_id: lineItem.product_id,
          variant_id: lineItem.variant_id,
          quantity: lineItem.quantity ?? 1,
          price: lineItem.price ?? 0,
        };
      });

      await LineItems.bulkCreate(lineItems, { transaction });
      return order;
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
