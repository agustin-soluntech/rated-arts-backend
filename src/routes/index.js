import express from "express";
import productsRouter from "./products.routes.js";
import editionsRouter from "./editions.routes.js";
import artistsRouter from "./artist.routes.js";
import sizesRouter from "./size.routes.js";
import ordersRouter from "./orders.routes.js";
import {uploadFile} from "../utils/uploadFile.js";
import moment from "moment";
import fetch from "node-fetch";
const router = express.Router();

router.use("/products", productsRouter);
router.use("/editions", editionsRouter);
router.use("/artists", artistsRouter);
router.use("/sizes", sizesRouter);
router.use("/orders", ordersRouter);

//make a route to upload files to s3
router.post("/upload", async (req, res) => {
  try {
    const file = req.files.file;
    const s3File = await uploadFile(file, aritstName);
    res.send(s3File);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong while uploading the file");
  }
});

export default router;
