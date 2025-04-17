require("dotenv").config();
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

// Import models with explicit tableName
db.Users = require("../models/User.model")(sequelize, Sequelize, { tableName: "Users" });
db.Deal = require("../models/Deal.model")(sequelize, Sequelize, { tableName: "Deals" });
db.Lead = require("../models/Lead.model")(sequelize, Sequelize, { tableName: "Leads" });
db.Meeting = require("../models/Meeting.model")(sequelize, Sequelize, { tableName: "Meetings" });
db.Opportunity = require("../models/Opportunity.model")(sequelize, Sequelize, { tableName: "Opportunities" });
db.ClientLead = require("../models/ClientLead.model")(sequelize, Sequelize, { tableName: "ClientLeads" });
db.Invoice = require("../models/Invoice.model")(sequelize, Sequelize, { tableName: "Invoices" });
db.ExecutiveActivity = require("../models/ExecutiveActivity.model")(sequelize, Sequelize, { tableName: "ExecutiveActivities" });
db.FollowUp = require("../models/FollowUp.model")(sequelize, Sequelize, { tableName: "FollowUps" });
db.FreshLead = require("../models/FreshLead.model")(sequelize, Sequelize, { tableName: "FreshLeads" });
db.ConvertedClient = require("../models/ConvertedClient.model")(sequelize, Sequelize, { tableName: "ConvertedClients" });
db.CloseLead = require("../models/CloseLead.model")(sequelize, Sequelize, { tableName: "CloseLeads" });
db.Notification = require("../models/Notification.model")(sequelize, Sequelize, { tableName: "Notifications" });

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
  onDelete: "CASCADE",
});
db.FreshLead.belongsTo(db.Lead, {
  foreignKey: "leadId",
  as: "lead",
});

// Lead → FollowUp
db.Lead.hasMany(db.FollowUp, {
  foreignKey: "leadId",
  onDelete: "CASCADE",
});
db.FollowUp.belongsTo(db.Lead, {
  foreignKey: "leadId",
  as: "lead",
});

// Lead → ConvertedClient
db.Lead.hasOne(db.ConvertedClient, {
  foreignKey: "leadId",
  onDelete: "CASCADE",
});
db.ConvertedClient.belongsTo(db.Lead, {
  foreignKey: "leadId",
  as: "lead",
});

// Lead → Deal
db.Lead.hasMany(db.Deal, {
  foreignKey: "leadId",
  onDelete: "CASCADE",
});
db.Deal.belongsTo(db.Lead, {
  foreignKey: "leadId",
});

// FreshLead → FollowUps (optional)
db.FreshLead.hasMany(db.FollowUp, {
  foreignKey: "fresh_lead_id",
  onDelete: "CASCADE",
  as: "followUps",
});
db.FollowUp.belongsTo(db.FreshLead, {
  foreignKey: "fresh_lead_id",
  as: "freshLead",
});

// FreshLead → ConvertedClient (optional)
db.FreshLead.hasOne(db.ConvertedClient, {
  foreignKey: "fresh_lead_id",
  onDelete: "CASCADE",
  as: "convertedClient",
});
db.ConvertedClient.belongsTo(db.FreshLead, {
  foreignKey: "fresh_lead_id",
  as: "freshLead",
});

// FreshLead → CloseLead (optional)
db.FreshLead.hasOne(db.CloseLead, {
  foreignKey: "freshLeadId",
  onDelete: "CASCADE",
  as: "closeLead",
});
db.CloseLead.belongsTo(db.FreshLead, {
  foreignKey: "freshLeadId",
  as: "freshLead",
});

// Users → Notifications
db.Users.hasMany(db.Notification, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
db.Notification.belongsTo(db.Users, {
  foreignKey: "userId",
});

// ------------------------
// Validate Schema
// ------------------------
async function validateSchema() {
  try {
    console.log("📌 Validating FollowUps table schema...");
    const followUpSchema = await db.FollowUp.describe();
    console.log("FollowUps schema:", followUpSchema);

    // Check if FollowUps table exists
    const [results] = await sequelize.query("SHOW TABLES LIKE 'FollowUps'");
    if (results.length === 0) {
      console.error("❌ FollowUps table does not exist in the database!");
    } else {
      console.log("✅ FollowUps table exists");
    }
  } catch (err) {
    console.error("❌ Error validating schema:", err);
  }
}
validateSchema();

// ------------------------
// Sync Models (Non-destructive)
// ------------------------
sequelize
  .sync({ force: false })
  .then(() => console.log("✅ Database tables synced"))
  .catch((err) => console.error("❌ Error syncing database:", err));

// ------------------------
// Debug
// ------------------------
console.log("📌 Loaded models:", Object.keys(db));

module.exports = db;