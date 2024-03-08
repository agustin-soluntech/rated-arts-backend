import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./database/database.js";
import "./models/Artists.js";
import "./models/Customers.js";
import "./models/Editions.js";
import "./models/LineItems.js";
import "./models/Orders.js";
import "./models/ProductImages.js";
import "./models/Products.js";
import "./models/Sizes.js";
import "./models/Variants.js";
dotenv.config();

const port = process.env.PORT || 3000;
async function main() {
  try {
    // Uncomment the following line to reset the database
    //await sequelize.sync({ force: true });
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

main();
