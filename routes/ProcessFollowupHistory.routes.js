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

//change the status to rejected in process person panel
router.post("/process-followup/reject", moveToRejected);

// POST - Create a follow-up entry
router.post("/process-followup/create", createProcessFollowUp);

//GET - Get all the follwups for logged in process person
router.get("/process-followup", getAllProcessFollowups);

//get meeting for process person
router.get("/process-followup/get-meeting", getProcessPersonMeetings);

//create meeting for process person
router.post("/process-followp/create-meeting", createMeetingForProcessPerson);

// GET - Get all follow-ups by fresh_lead_id
router.get(
  "/process-followup/:fresh_lead_id",
  getProcessFollowUpsByFreshLeadId
);

module.exports = router;
