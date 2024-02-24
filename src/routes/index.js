import express from 'express';
import productsRouter from './products.routes.js';
import editionsRouter from './editions.routes.js';

const router = express.Router();

router.use('/products', productsRouter);
router.use('/editions', editionsRouter);

export default router;