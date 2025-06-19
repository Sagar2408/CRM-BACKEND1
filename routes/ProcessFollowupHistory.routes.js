const express = require("express");
const router = express.Router();

const {
  createProcessFollowUp,
  getProcessFollowUpsByFreshLeadId,
} = require("../controllers/ProcessFollowUpHistory.controller");

// POST - Create a follow-up entry
router.post("/process-followup", createProcessFollowUp);

// GET - Get all follow-ups by fresh_lead_id
router.get("/process-followup/:fresh_lead_id", getProcessFollowUpsByFreshLeadId);

module.exports = router;
