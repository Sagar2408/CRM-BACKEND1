


const express = require('express');
const router = express.Router();
const { sendEodEmail } = require('../controllers/Eod.controller'); // 👈 Make sure this matches

router.post('/report', sendEodEmail); // 👈 POST callback should not be undefined

module.exports = router;