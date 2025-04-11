const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followup.controller');

// Create follow-up
router.post('/create', followUpController.createFollowUp);

// Get all follow-ups
router.get('/all', followUpController.getAllFollowUps);

module.exports = router;
