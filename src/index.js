import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./database/database.js";
import "./models/Products.js";
import "./models/Artist.js";
import "./models/Size.js";
import "./models/Editions.js";
dotenv.config();

const port = process.env.PORT || 3000;
async function main() {
  try {
    // Uncomment the following line to reset the database
    // await sequelize.sync({ force: true });
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

main();
