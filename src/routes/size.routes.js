import { Router } from "express";
import { getProportionalSizes } from "../controllers/size.controller.js";

const router = Router();

router.post("/", getProportionalSizes);

export default router;
