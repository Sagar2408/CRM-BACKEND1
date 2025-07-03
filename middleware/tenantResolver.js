const { getTenantDB } = require("../config/sequelizeManager");
const { masterDB } = require("../config/masterDB");
const { Op } = require("sequelize");

const skipTenantPaths = ["/api/masteruser/login", "/api/masteruser/signup"];

/**
 * Utility: Extract and clean companyId from req
 */
function extractCompanyId(req) {
  const sources = [
    req.body?.companyId,
    req.query?.companyId,
    req.headers["x-company-id"],
  ];
  for (let id of sources) {
    if (typeof id === "string") {
      return id.trim().replace(/[^a-z0-9\-]/gi, "");
    }
  }
  return null;
}

module.exports = async (req, res, next) => {
  // ⏭️ Skip middleware for master‐level endpoints
  if (skipTenantPaths.some((path) => req.originalUrl.startsWith(path))) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`🏁 [TENANT] Skipping tenantResolver for ${req.originalUrl}`);
    }
    return next();
  }

  // 🔍 Extract companyId
  const companyId = extractCompanyId(req);
  if (!companyId) {
    console.warn("⚠️ [TENANT] Missing or invalid companyId");
    return res.status(400).json({ message: "Missing or invalid companyId" });
  }

  try {
    // 📖 Load company metadata from master DB
    const Company = masterDB.models.Company;
    const company = await Company.findByPk(companyId);

    if (!company) {
      return res
        .status(404)
        .json({ message: "Invalid companyId or company not found" });
    }

    const now = new Date();

    // ⏰ Expiration check
    if (company.expiryDate && new Date(company.expiryDate) <= now) {
      return res
        .status(403)
        .json({ message: "Subscription expired – please renew." });
    }

    // 📆 SetDate (start date) check
    if (company.setDate && now < new Date(company.setDate)) {
      return res.status(403).json({
        message: `Access not allowed until ${new Date(
          company.setDate
        ).toDateString()}.`,
      });
    }

    // ⏸️ Pause check
    if (company.status === "paused") {
      return res.status(403).json({ message: "Access is temporarily paused." });
    }

    // ⛔ Blacklist check (in case cron hasn't run yet)
    if (company.status === "blacklisted") {
      return res
        .status(403)
        .json({ message: "Company is blacklisted – please contact support." });
    }

    // 🔌 Connect to tenant DB (all checks passed)
    const tenantDB = await getTenantDB(companyId);
    if (!tenantDB) {
      console.error("❌ [TENANT] No DB returned for:", companyId);
      return res
        .status(500)
        .json({ message: "Error resolving tenant database" });
    }

    // 💾 Attach tenant context and continue
    req.db = tenantDB;
    req.companyId = companyId;
    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ [TENANT] Resolved tenant for ${companyId}`);
    }
    return next();
  } catch (err) {
    console.error("❌ [TENANT] Error in tenantResolver:", err);
    return res
      .status(500)
      .json({ message: "Internal error resolving tenant", error: err.message });
  }
};
