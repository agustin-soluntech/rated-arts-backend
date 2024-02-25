import express from "express";
import productsRouter from "./products.routes.js";
import editionsRouter from "./editions.routes.js";
import artistsRouter from "./artist.routes.js";
import sizesRouter from "./size.routes.js";
const router = express.Router();

router.use("/products", productsRouter);
router.use("/editions", editionsRouter);
router.use("/artists", artistsRouter);
router.use("/sizes", sizesRouter);

export default router;
