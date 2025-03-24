require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/sequelize");
const userRoutes = require("./routes/User.routes");
const dealRoutes = require("./routes/Deal.routes");
const leadRoutes = require("./routes/Lead.routes");
const opportunityRoutes = require("./routes/Opportunity.routes");
const clientLeadRoutes = require("./routes/ClientLead.routes");
const meetingRoutes = require("./routes/Meeting.routes");
const invoiceRoutes = require("./routes/Invoices.routes");
const chatbotRoutes = require("./routes/Chatbot.routes");
const cookieParser = require("cookie-parser");
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

app.use("/api", userRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/client-leads", clientLeadRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api", chatbotRoutes);

console.log("🔄 Starting server...");
// ✅ Ensure `db.sequelize` exists before syncing
if (db.sequelize) {
  db.sequelize
    .sync({ alter: false })
    .then(() => console.log("✅ Database schema synchronized"))
    .catch((err) => console.error("❌ Schema synchronization failed:", err));
} else {
  console.error("❌ Sequelize instance not initialized.");
}
console.log("✅ Reached end of server.js");
module.exports = app;
// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}
