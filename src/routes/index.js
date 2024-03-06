import express from "express";
import productsRouter from "./products.routes.js";
import editionsRouter from "./editions.routes.js";
import artistsRouter from "./artist.routes.js";
import sizesRouter from "./size.routes.js";
import {uploadFile} from "../utils/uploadFile.js";
import moment from "moment";
import fetch from "node-fetch";
const router = express.Router();

router.use("/products", productsRouter);
router.use("/editions", editionsRouter);
router.use("/artists", artistsRouter);
router.use("/sizes", sizesRouter);

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

router.get("/orders", async (req, res) => {
  try {
    let response = await fetch(
      `${process.env.SHOPIFY_API_URL}/admin/api/2023-04/orders.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );
    const parsedResponse = await response.json();

    const ordersId = parsedResponse.orders.map((order) => {
      return order.id;
    });

    let responseOrderDetails = await Promise.all(
      ordersId.map((id) =>
        fetch(
          `${process.env.SHOPIFY_API_URL}/admin/api/2023-04/orders/${id}.json`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            },
          }
        )
      )
    );

    const parsedResponseOrderDetails = await Promise.all(
      responseOrderDetails.map((res) => res.json())
    );

    const mappedOrders = parsedResponseOrderDetails.map((order) => {
      return {
        id: order.order.id ?? "",
        date: order.order.created_at
          ? moment(order.order.created_at).format("MMM D [at] h:mm a")
          : "",
        total: order.order.total_price ?? 0,
        lineItems: order.order.line_items
          ? order.order.line_items.map((item) => {
              const parts = item.name.split(" - ");
              const name = parts[0];
              const [type, size, frames] = parts[1].split(" / ");
              return {
                title: name ?? "",
                quantity: item.quantity ?? "",
                price: item.price ?? "",
                size: size ?? "",
                type: type ?? "",
                frames: frames ?? "",
                itemId: item.id ?? "",
                sku: item.sku ?? "",
              };
            })
          : [],
        customerInfo: order.order.billing_address
          ? {
              name: order.order.billing_address.name ?? "",
              phone: order.order.billing_address.phone ?? "",
              address: order.order.billing_address.address1 ?? "",
              city: order.order.billing_address.city ?? "",
              province: order.order.billing_address.province ?? "",
              zip: order.order.billing_address.zip ?? "",
              country: order.order.billing_address.country ?? "",
            }
          : {},
      };
    });
    console.log(mappedOrders[0]);
    res.send(mappedOrders);
  } catch (error) {
    console.log(error);
  }
});

export default router;
