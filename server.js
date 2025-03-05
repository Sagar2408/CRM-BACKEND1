require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/sequelize");
const passport = require("passport");
const userRoutes = require("./routes/User.routes");
const cookieParser = require("cookie-parser");
const configurePassport = require("./config/passport");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Enable cookies
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing
app.use(passport.initialize());
configurePassport();

app.use("/api", userRoutes);

// ✅ Ensure `db.sequelize` exists before syncing
if (db.sequelize) {
  db.sequelize
    .sync({ alter: false })
    .then(() => console.log("✅ Database schema synchronized"))
    .catch((err) => console.error("❌ Schema synchronization failed:", err));
} else {
  console.error("❌ Sequelize instance not initialized.");
}

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
