const express = require("express");
const router = express.Router();
const followUpController = require("../controllers/Followup.controller");

// Create follow-up
router.post("/create", followUpController.createFollowUp);
router.put("/:id", followUpController.updateFollowUp);

module.exports = router;
