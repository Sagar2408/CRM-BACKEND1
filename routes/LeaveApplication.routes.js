const express = require("express");
const router = express.Router();

const {
  createLeaveApplication,
  getLeaveApplication,
} = require("../controllers/LeaveApplication.controller");

router.post("/apply", createLeaveApplication);
router.get("/", getLeaveApplication);

module.exports = router;
