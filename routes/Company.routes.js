const express = require("express");
const router = express.Router();
const { createCompany } = require("../controllers/Company.controller");

// No auth or tenantResolver needed
router.post("/create-company", createCompany);

module.exports = router;
