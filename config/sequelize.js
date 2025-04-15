require("dotenv").config(); // Load environment variables from .env
const { Sequelize } = require("sequelize");

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: console.log,
  }
);

// Test connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to MySQL database using Sequelize"))
  .catch((err) => console.error("❌ Unable to connect to the database:", err));

// Initialize models
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Users = require("../models/User.model")(sequelize, Sequelize);
db.Deal = require("../models/Deal.model")(sequelize, Sequelize);
db.Lead = require("../models/Lead.model")(sequelize, Sequelize);
db.Meeting = require("../models/Meeting.model")(sequelize, Sequelize);
db.Opportunity = require("../models/Opportunity.model")(sequelize, Sequelize);
db.ClientLead = require("../models/ClientLead.model")(sequelize, Sequelize);
db.Invoice = require("../models/Invoice.model")(sequelize, Sequelize);
db.ExecutiveActivity = require("../models/ExecutiveActivity.model")(
  sequelize,
  Sequelize
);
db.FollowUp = require("../models/FollowUp.model")(sequelize, Sequelize);
db.FreshLead = require("../models/FreshLead.model")(sequelize, Sequelize);
db.ConvertedClient = require("../models/ConvertedClient.model")(
  sequelize,
  Sequelize
);
db.CloseLead = require("../models/CloseLead.model")(sequelize, Sequelize);
db.Notification = require("../models/Notification.model")(sequelize, Sequelize);

// ------------------------
// Define Associations
// ------------------------

// Users → ExecutiveActivity
db.Users.hasMany(db.ExecutiveActivity, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
db.ExecutiveActivity.belongsTo(db.Users, { foreignKey: "userId" });

// ClientLead → Lead
db.ClientLead.hasMany(db.Lead, {
  foreignKey: "clientLeadId",
  onDelete: "CASCADE",
});
db.Lead.belongsTo(db.ClientLead, { foreignKey: "clientLeadId" });

// Lead → FreshLead
db.Lead.hasOne(db.FreshLead, {
  foreignKey: "leadId",
});
db.FreshLead.belongsTo(db.Lead, {
  foreignKey: "leadId",
  as: "Lead", // ✅ unique alias
});

// Lead → Deal
db.Lead.hasMany(db.Deal, { foreignKey: "leadId", onDelete: "CASCADE" });
db.Deal.belongsTo(db.Lead, { foreignKey: "leadId" });

// FreshLead → FollowUps
db.FreshLead.hasMany(db.FollowUp, {
  foreignKey: "fresh_lead_id",
  onDelete: "CASCADE",
  as: "followUps",
});
db.FollowUp.belongsTo(db.FreshLead, {
  foreignKey: "fresh_lead_id",
  as: "freshLead",
});

// FreshLead → ConvertedClient
db.FreshLead.hasOne(db.ConvertedClient, {
  foreignKey: "fresh_lead_id",
});
db.ConvertedClient.belongsTo(db.FreshLead, {
  foreignKey: "fresh_lead_id",
  as: "FreshLead",
});

db.FreshLead.hasOne(db.CloseLead, {
  foreignKey: "freshLeadId",
  onDelete: "CASCADE",
  as: "closeLead",
});
db.CloseLead.belongsTo(db.FreshLead, {
  foreignKey: "freshLeadId",
  as: "freshLead",
});
db.Users.hasMany(db.Notification, {
  foreignKey: "userId", // Define the foreign key on the Notification model
  onDelete: "CASCADE", // If the user is deleted, delete related notifications
});
db.Notification.belongsTo(db.Users, {
  foreignKey: "userId", // Foreign key to User model
});
// ------------------------
// Debug
// ------------------------
console.log("📌 Loaded models:", Object.keys(db));

module.exports = db;
