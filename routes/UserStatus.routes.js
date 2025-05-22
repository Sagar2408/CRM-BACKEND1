/**
 * User Status Routes
 * Endpoints for managing user login status
 */

const express = require('express');
const router = express.Router();
const { updateUserLoginStatus, getUserLoginStatus } = require('../controllers/UserStatus.controller');
const auth = require('../middleware/auth');
const authMaster = require('../middleware/authMaster');

// Routes require authentication and admin/master privileges
router.put('/login-status', auth(['Admin']), updateUserLoginStatus);
router.get('/login-status/:userId', auth(['Admin']), getUserLoginStatus);

module.exports = router;