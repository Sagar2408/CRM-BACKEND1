require("dotenv").config(); // Load environment variables from the .env file

const mysql = require("mysql2"); // Import MySQL2 library for database connection

// Create a connection to the MySQL database using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Database host (e.g., localhost or remote server)
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Name of the database
  port: process.env.DB_PORT || 3300, // Database port (defaulting to 3300 if not provided)
});

// Establish a connection to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err); // Log error if connection fails
    return;
  }
  console.log("✅ Connected to MySQL database"); // Success message if connected
});

module.exports = db; // Export the database connection for use in other files
