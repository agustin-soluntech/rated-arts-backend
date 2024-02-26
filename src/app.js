import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import fileUpload from "express-fileupload";
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
