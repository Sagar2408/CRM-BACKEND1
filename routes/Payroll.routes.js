const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/Payroll.controller");

//Genarate payroll for all executives for a month
router.post("/generate/all", payrollController.generatePayroll);
//Generate payroll for single executive
router.post("/generate/single", payrollController.generateSinglePayroll);
//Get all payroll
router.get("/all", payrollController.getAllPayrolls);
//Get single executives payroll
router.get("/single", payrollController.getPayrollForExecutive);

module.exports = router;
