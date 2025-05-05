const { masterDB } = require("../config/masterDB"); // assuming masterDB is exported
const { getTenantDB } = require("../config/sequelizeManager");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createCompany = async (req, res) => {
  const { name, db_name, db_host, db_user, db_password, db_port } = req.body;

  if (!name || !db_name || !db_host || !db_user || !db_password || !db_port) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const Company = masterDB.models.Company;

    // Check for existing company
    const existing = await Company.findOne({
      where: { name },
    });

    if (existing) {
      return res.status(409).json({ message: "Company already exists" });
    }

    // Create new company
    const company = await Company.create({
      name,
      db_name,
      db_host,
      db_user,
      db_password,
      db_port,
    });

    // (Optional) Immediately initialize tenant DB
    await getTenantDB(company.id);

    return res.status(201).json({ message: "Company created", company });
  } catch (err) {
    console.error("Error creating company:", err);
    return res.status(500).json({ message: "Failed to create company" });
  }
};

const getCompaniesForMasterUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: verify decoded email/role if needed
    if (!decoded || !decoded.email) {
      return res.status(403).json({ message: "Invalid master token" });
    }

    const Company = masterDB.models.Company;
    const companies = await Company.findAll();

    return res.status(200).json({
      message: "Companies retrieved successfully",
      companies,
    });
  } catch (error) {
    console.error("Token verification or DB error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  createCompany,
  getCompaniesForMasterUser,
};
