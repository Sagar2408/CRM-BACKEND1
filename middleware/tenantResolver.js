const { getTenantDB } = require("../config/sequelizeManager");

const skipTenantPaths = ["/api/masteruser/login", "/api/masteruser/signup"];

module.exports = async (req, res, next) => {
  // Skip tenant check for predefined paths
  if (skipTenantPaths.some((path) => req.originalUrl.startsWith(path))) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`🏁 [TENANT] Skipping tenantResolver for ${req.originalUrl}`);
    }
    return next();
  }

  try {
    // Step 1: Resolve companyId from request
    const companyId =
      req.body.companyId || req.query.companyId || req.headers["x-company-id"];

    console.log("🔍 [TENANT] Attempting to resolve companyId from request");
    console.log("➡️ From body:", req.body.companyId);
    console.log("➡️ From query:", req.query.companyId);
    console.log("➡️ From header:", req.headers["x-company-id"]);
    console.log("📦 Final resolved companyId:", companyId);

    // Step 2: Validate
    if (!companyId || typeof companyId !== "string" || !companyId.trim()) {
      console.warn("⚠️ [TENANT] Missing or invalid companyId");
      return res.status(400).json({ message: "Missing or invalid companyId" });
    }

    // Step 3: Attempt to connect to tenant DB
    console.log(`🔧 [TENANT] Calling getTenantDB('${companyId}')`);
    const tenantDB = await getTenantDB(companyId.trim());

    // Step 4: Check for result
    if (!tenantDB) {
      console.error("❌ [TENANT] No tenant DB returned from getTenantDB");
      return res
        .status(404)
        .json({ message: "Invalid companyId or DB not configured" });
    }

    // Step 5: Attach resolved DB to request
    req.db = tenantDB;
    req.companyId = companyId.trim();

    console.log(
      `✅ [TENANT] Tenant DB successfully resolved for companyId: ${companyId}`
    );
    return next();
  } catch (err) {
    // Step 6: Log and handle errors
    console.error("❌ [TENANT] Error resolving tenant:", err.message || err);
    if (process.env.NODE_ENV !== "production") {
      console.error("📋 Full error stack:", err);
    }
    return res
      .status(500)
      .json({ message: "Error resolving tenant", error: err.message });
  }
};
