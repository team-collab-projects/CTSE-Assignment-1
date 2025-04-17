const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const URL = process.env.MONGODB_URL;

const databaseConnection = () => {
  mongoose.set("strictQuery", true);

  mongoose.connect(URL)
    .then(() => {
      console.log("✅ Database connected successfully.");
    })
    .catch((err) => {
      console.error("❌ Database connection failed:", err.message);
      process.exit(1);
    });
};

module.exports = databaseConnection;
