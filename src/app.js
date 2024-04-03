/* This code snippet is setting up a basic Express server in a Node.js environment. Here's a breakdown
of what each part is doing: */
import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
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
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

export default app;
