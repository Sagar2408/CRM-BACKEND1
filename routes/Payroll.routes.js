const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/Payroll.controller");

//Generate payroll for single executive
router.post("/generate", payrollController.generatePayroll);
//Get all payroll
router.get("/", payrollController.getAllPayrolls);
//Get single executives payroll
router.get("/one", payrollController.getPayrollForExecutive);

module.exports = router;
