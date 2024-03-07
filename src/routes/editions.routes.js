import { Router } from "express";
import { getEditions } from "../controllers/editions.controller.js";

const router = Router();

router.get("/", getEditions);

export default router;
