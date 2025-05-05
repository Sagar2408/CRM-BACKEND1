const express = require("express");
const router = express.Router();
const {
  createCompany,
  getCompaniesForMasterUser,
} = require("../controllers/Company.controller");

// No auth or tenantResolver needed
router.post("/create-company", createCompany);
router.get("/master/companies", getCompaniesForMasterUser); // Token required

module.exports = router;
