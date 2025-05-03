// middleware/tenantResolver.js
const { getTenantDB } = require("../config/sequelizeManager");

module.exports = async (req, res, next) => {
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
    console.error("Tenant resolution error:", err);
    res.status(500).json({ message: "Error resolving tenant" });
  }
};
