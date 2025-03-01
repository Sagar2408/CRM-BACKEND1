require("dotenv").config(); // Load environment variables

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "qwe123qwe",
  database: process.env.DB_NAME || "AtoZee",
  port: process.env.DB_PORT || 3300,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

module.exports = db;
