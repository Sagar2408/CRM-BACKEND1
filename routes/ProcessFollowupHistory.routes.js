const express = require("express");
const router = express.Router();

const {
  createProcessFollowUp,
  getProcessFollowUpsByFreshLeadId,
  getAllProcessFollowups,
  moveToRejected,
  createMeetingForProcessPerson,
  getProcessPersonMeetings,
} = require("../controllers/ProcessFollowUpHistory.controller");

// POST - Create a follow-up entry
router.post("/process-followup", createProcessFollowUp);

// GET - Get all follow-ups by fresh_lead_id
router.get(
  "/process-followup/:fresh_lead_id",
  getProcessFollowUpsByFreshLeadId
);

//GET - Get all the follwups for logged in process person
router.get("/process-followup", getAllProcessFollowups);

//change the status to rejected in process person panel
router.post("/process-followup/reject", moveToRejected);

//create meeting for process person
router.post("/process-followp/create-meeting", createMeetingForProcessPerson);

//get meeting for process person
router.get("/process-followup/get-meeting", getProcessPersonMeetings);

module.exports = router;
