import { Router } from "express";
import {
  createProducts,
  getImageUrlToPrint,
} from "../controllers/products.controller.js";

const router = Router();

router.post("/", createProducts);
router.get("/imageUrlToPrint", getImageUrlToPrint);

export default router;
