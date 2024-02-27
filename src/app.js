import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import fileUpload from "express-fileupload";
/*import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';

const shopify = shopifyApi({
  // The next 4 values are typically read from environment variables for added security
  apiKey: process.env.SHOPIFY_ACCESS_TOKEN,
  apiSecretKey: 'APISecretFromPartnersDashboard',
  scopes: ['read_products'],
  hostName: 'ngrok-tunnel-address',
});*/

const app = express();

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  })
);
app.use(cors());
//middlewares
app.use(express.json());
app.use("/", routes);

export default app;
