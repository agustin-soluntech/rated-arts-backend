import { sequelize } from "../database/database.js";
import { Customers } from "../models/Customers.js";
import { LineItems } from "../models/LineItems.js";
import { Orders } from "../models/Orders.js";
import { Products } from "../models/Products.js";
import { Variants } from "../models/Variants.js";
import { getProductById } from "../utils/shopify.js";
import {
  createProductAndVariants,
  findMissingProducts,
} from "./products.controller.js";

export const getOrders = async (req, res) => {
  const limit = req.query.limit;
  const offset = req.query.offset;
  try {
    const orders = await Orders.findAll({
      include: [
        {
          model: LineItems,
          as: "LineItems",
          include: [
            {
              model: Products,
              as: "Product",
            },
          ],
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
          include: [
            {
              model: Variants,
              as: "Variant",
            },
          ],
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
      await Customers.upsert(
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
          artist_name: orderData.line_items[0].vendor,
          currency: orderData.currency,
          customer_id: orderData.customer.id,
          created_at: orderData.created_at,
        },
        { transaction }
      );

      const lineItems = orderData.line_items.map((lineItem) => {
        const parts = lineItem.name.split(" - ");
        const [type, size, frames] = parts[1].split(" / ");
        const vers = `${type}${frames}_${lineItem.title}`;
        const sizeForUrl = size.replace(/\"|\s/g, "");
        let imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${lineItem.vendor}/${lineItem.title}/shopify/${vers}.jpg`;
        imageUrl = imageUrl.replace(/\s/g, "+");
        let resizedImageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3${process.env.AWS_REGION}.amazonaws.com/${lineItem.vendor}/${lineItem.title}/${sizeForUrl}.jpg`;
        resizedImageUrl = resizedImageUrl.replace(/ /g, "+");
        return {
          id: lineItem.id,
          name: lineItem.title,
          order_id: order.id ?? "",
          product_id: lineItem.product_id ?? null,
          variant_id: lineItem.variant_id ?? null,
          quantity: lineItem.quantity ?? 1,
          price: parseFloat(lineItem.price) || 0,
          size: size ?? "",
          type: type ?? "",
          frames: frames ?? "",
          imageUrl,
          resizedImageUrl,
          sku: lineItem.sku ?? "",
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
