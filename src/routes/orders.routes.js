import { Router } from 'express';
import { createOrder, getOrderById, getOrders } from '../controllers/orders.controller';

const router = Router();

router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/', createOrder)

export default router;