const express = require("express");
const cors = require("cors");
const databaseConnection = require("./config/dbConnection");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 8090;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:4000"],
    credentials: true,
  })
);

app.use("/api/users", require("./routes/userRoutes"));

// Optional root route - will only match "/"
app.get("/", (req, res) => {
  res.json("Hello World!! Api is Calling You =)");
});

// Catch-all for undefined routes (optional but recommended)
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  databaseConnection();
});

module.exports = app;
