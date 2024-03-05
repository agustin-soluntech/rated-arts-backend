import { Sequelize } from 'sequelize';
import { Customers } from '../models/Customers.js';
import { LineItems } from '../models/LineItems.js';
import { Orders } from '../models/Orders.js';

export const getOrders = async (req, res) => {
  const limit = req.query.limit;
  const offset = req.query.offset;
  try {
    const orders = await Orders.findAll({ 
      include: [
        {
          model: LineItems,
          as: 'LineItems',
        },
        {
          model: Customers,
          as: 'Customer',
          
        }
      ], 
      limit, 
      offset,
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Orders.findByPk(req.params.id, {
      include: [
        {
          model: LineItems,
          as: 'LineItems',
        },
        {
          model: Customers,
          as: 'Customer',
          
        }
      ],
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const createOrder = async (req, res) => {
  const orderData = req.body;
  try {
    const transaction = await Sequelize.transaction(
      async (transaction) => {
        const customer = await customers.create({
          id: order.order.customer.id,
          first_name: order.order.billing_address.first_name ?? "",
          last_name: order.order.billing_address.last_name ?? "",
          name: order.order.billing_address.name ?? "",
          phone: order.order.billing_address.phone ?? "",
          address: order.order.billing_address.address1 ?? "",
          city: order.order.billing_address.city ?? "",
          province: order.order.billing_address.province ?? "",
          zip: order.order.billing_address.zip ?? "",
          country: order.order.billing_address.country ?? "",
        }, { transaction });
        const order = await Orders.create({
          id: orderData.id,
          order_number: orderData.order_number,
          created_at: orderData.created_at,
          total: orderData.total,
          currency: orderData.currency,
          customer_id: customer.id,
        }, { transaction });
      },
    );
    const order = await Orders.create({
      id: orderData.id,
      order_number: orderData.order_number,
      created_at: orderData.created_at,
      total: orderData.total,
      currency: orderData.currency,
      customer_id: orderData.customer_id,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}