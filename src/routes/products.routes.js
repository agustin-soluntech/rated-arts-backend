import { Router } from 'express';
import {createProducts} from '../controllers/products.controller.js'

const router = Router();

router.post('/', createProducts)

export default router;