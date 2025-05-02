const { getTenantDB } = require("../config/sequelizeManager");

/**
 * Middleware to resolve and attach tenant DB
 * - Uses req.companyId (set in auth.js)
 * - Loads dynamic Sequelize connection and models
 * - Attaches req.db
 */
module.exports = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.headers["x-company-id"];

    if (!companyId) {
      return res.status(400).json({ error: "Missing company ID" });
    }

    const tenantDB = await getTenantDB(companyId);
    req.db = tenantDB;

    next();
  } catch (err) {
    console.error("❌ Tenant resolution error:", err);
    return res.status(500).json({ error: "Failed to resolve tenant database" });
  }
};
