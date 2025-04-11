require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // Required for Socket.IO
const { Server } = require("socket.io"); // Socket.IO
const cookieParser = require("cookie-parser");

// DB Config
const db = require("./config/sequelize");
const sequelize = db.sequelize; // ✅ Fix: define sequelize
const Sequelize = db.Sequelize; // ✅ Fix: define Sequelize

// Models
const Followup = require('./models/Followup.model')(sequelize, Sequelize.DataTypes);
db.FollowUp = Followup;

// Routes
const userRoutes = require("./routes/User.routes");
const dealRoutes = require("./routes/Deal.routes");
const leadRoutes = require("./routes/Lead.routes");
const clientLeadRoutes = require("./routes/ClientLead.routes");
const meetingRoutes = require("./routes/Meeting.routes");
const opportunityRoutes = require("./routes/Opportunity.routes");
const invoiceRoutes = require("./routes/Invoices.routes");
const chatbotRoutes = require("./routes/Chatbot.routes");
const ExecutiveActivityRoutes = require("./routes/ExecutiveActivity.routes");
const followupRoutes = require('./routes/Followup.routes');

const app = express();
const server = http.createServer(app); // HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/followup', followupRoutes);
app.use("/api", userRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/client-leads", clientLeadRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/executive-activities", ExecutiveActivityRoutes);

// Sync Sequelize DB
console.log("🔄 Starting server...");
if (sequelize) {
  sequelize
    .sync({ alter: false })
    .then(() => console.log("✅ Database schema synchronized"))
    .catch((err) => console.error("❌ Schema synchronization failed:", err));
} else {
  console.error("❌ Sequelize instance not initialized.");
}
console.log("✅ Reached end of server.js");

// ⏺️ Socket.IO logic: User Online Status
io.on("connection", (socket) => {
  console.log("🟢 New socket connection:", socket.id);

  socket.on("set_user", async (userId) => {
    try {
      const User = db.Users;
      socket.userId = userId;

      await User.update({ is_online: true }, { where: { id: userId } });

      io.emit("status_update", { userId, is_online: true });
    } catch (err) {
      console.error("⚠️ Error setting user online:", err);
    }
  });

  socket.on("disconnect", async () => {
    const userId = socket.userId;
    if (userId) {
      try {
        const User = db.Users;

        await User.update({ is_online: false }, { where: { id: userId } });

        io.emit("status_update", { userId, is_online: false });
        console.log("🔴 User disconnected:", userId);
      } catch (err) {
        console.error("⚠️ Error setting user offline:", err);
      }
    }
  });
});

// Export app for tests
module.exports = app;

// Start Server
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}
