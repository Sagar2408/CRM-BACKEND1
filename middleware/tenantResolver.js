const { getTenantDB } = require("../config/sequelizeManager");

const skipTenantPaths = ["/api/masteruser/login", "/api/masteruser/signup"];

module.exports = async (req, res, next) => {
  if (skipTenantPaths.some((path) => req.originalUrl.startsWith(path))) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`🏁 [TENANT] Skipping tenantResolver for ${req.originalUrl}`);
    }
    return next();
  }

  try {
    const companyId =
      req.body.companyId || req.query.companyId || req.headers["x-company-id"];

    if (!companyId) {
      return res.status(400).json({ message: "Missing companyId" });
    }

    const tenantDB = await getTenantDB(companyId);

    if (!tenantDB) {
      return res.status(404).json({ message: "Invalid companyId" });
    }

    req.db = tenantDB;
    req.companyId = companyId;

    next();
  } catch (err) {
    console.error("❌ [TENANT] Error resolving tenant:", err);
    res.status(500).json({ message: "Error resolving tenant" });
  }
};
