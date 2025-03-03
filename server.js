require("dotenv").config();
const express = require("express");
const db = require("./config/sequelize"); // Ensure correct path
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// ✅ Ensure `db.sequelize` exists before syncing
if (db.sequelize) {
  db.sequelize
    .sync({ alter: true })
    .then(() => console.log("✅ Database schema synchronized"))
    .catch((err) => console.error("❌ Schema synchronization failed:", err));
} else {
  console.error("❌ Sequelize instance not initialized.");
}

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
