const { getTenantDB } = require("../config/sequelizeManager");

const skipTenantPaths = ["/api/masteruser/login", "/api/masteruser/signup"];

module.exports = async (req, res, next) => {
  // ⏭️ Skip tenant check for master routes
  if (skipTenantPaths.some((path) => req.originalUrl.startsWith(path))) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`🏁 [TENANT] Skipping tenantResolver for ${req.originalUrl}`);
    }
    return next();
  }

  try {
    // 🧪 Step 1: Extract and sanitize companyId
    const rawCompanyId =
      req.body.companyId || req.query.companyId || req.headers["x-company-id"];
    const companyId =
      typeof rawCompanyId === "string"
        ? rawCompanyId.trim().replace(/[^a-z0-9\-]/gi, "")
        : null;

    console.log("📦 Resolved companyId:", companyId);

    // ❌ Step 2: Validate
    if (!companyId) {
      console.warn("⚠️ [TENANT] Missing or invalid companyId");
      return res.status(400).json({ message: "Missing or invalid companyId" });
    }

    // 🔌 Step 3: Connect to tenant DB
    const tenantDB = await getTenantDB(companyId);

    if (!tenantDB) {
      console.error("❌ [TENANT] No tenant DB returned from getTenantDB");
      return res
        .status(404)
        .json({ message: "Invalid companyId or DB not configured" });
    }

    // 💾 Step 4: Attach DB to request
    req.db = tenantDB;
    req.companyId = companyId;

    console.log(`✅ [TENANT] Tenant DB resolved for companyId: ${companyId}`);
    return next();
  } catch (err) {
    // 🛑 Step 5: Handle DB or connection errors
    console.error("❌ [TENANT] Error resolving tenant:", err.message || err);
    if (process.env.NODE_ENV !== "production") {
      console.error("📋 Stack:", err);
    }
    return res
      .status(500)
      .json({ message: "Error resolving tenant", error: err.message });
  }
};
