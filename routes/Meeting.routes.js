const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/Meeting.controller");

// Define routes
router.get("/", meetingController.getAllMeetings);
router.get("/:id", meetingController.getMeetingById);
router.post("/", meetingController.createMeeting);
router.put("/:id", meetingController.updateMeeting);
router.delete("/:id", meetingController.deleteMeeting);

module.exports = router;
