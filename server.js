require("dotenv").config();
require("./cron/notificationCleaner"); // Adjust the path as needed
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

// DB Config
const db = require("./config/sequelize");
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

const Notification = db.Notification; // ✅ Notification model

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
const followupRoutes = require("./routes/Followup.routes");
const FreshLeadRoutes = require("./routes/FreshLead.routes");
const ConvertedClient = require("./routes/ConvertedClient.routes");
const CloseLeadRoutes = require("./routes/CloseLead.routes");
const NotificationRoutes = require("./routes/Notification.routes");
const executiveDashboardRoutes = require("./routes/Executivedashboard.routes");
const SettingsRoutes = require("./routes/Settings.routes");
const FollowUpHistory = require("./routes/FollowUpHistory.routes");

const app = express();
const server = http.createServer(app);

// ⏺️ SOCKET.IO SETUP
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
app.use("/api/followup", followupRoutes);
app.use("/api", userRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/client-leads", clientLeadRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/executive-activities", ExecutiveActivityRoutes);
app.use("/api/freshleads", FreshLeadRoutes);
app.use("/api/converted", ConvertedClient);
app.use("/api/close-leads", CloseLeadRoutes);
app.use("/api/notification", NotificationRoutes);
app.use("/api/executive-dashboard", executiveDashboardRoutes);
app.use("/api/settings", SettingsRoutes);
app.use("/api/followuphistory", FollowUpHistory);

// Sequelize Sync
console.log("🔄 Starting server...");
if (sequelize) {
  sequelize
    .sync({ alter: false })
    .then(() => console.log("✅ Database schema synchronized"))
    .catch((err) => console.error("❌ Schema synchronization failed:", err));
} else {
  console.error("❌ Sequelize instance not initialized.");
}

// 🧠 Store connected users
const connectedUsers = {};

// 🔌 SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log("🟢 New socket connection:", socket.id);

  socket.on("set_user", async (userId) => {
    try {
      const User = db.Users;
      socket.userId = userId;

      connectedUsers[userId] = socket.id;

      await User.update({ is_online: true }, { where: { id: userId } });
      io.emit("status_update", { userId, is_online: true });
    } catch (err) {
      console.error("⚠️ Error setting user online:", err);
    }
  });

  socket.on("disconnect", async () => {
    const userId = socket.userId;
    if (userId) {
      delete connectedUsers[userId];

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

// 🔔 Notification Helper Function
const sendNotificationToUser = (userId, notification) => {
  const socketId = connectedUsers[userId];
  if (socketId) {
    io.to(socketId).emit("new_notification", notification);
    console.log(`📨 Sent notification to user ${userId}`);
  } else {
    console.log(`⚠️ User ${userId} not connected`);
  }
};

module.exports = {
  app,
  sendNotificationToUser,
};

// Start Server
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}
