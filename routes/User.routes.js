// routes/User.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/User.controller");

// Local signup and login routes
router.post("/signup", userController.signupLocal);
router.post("/login", userController.login);

// User profile route (assuming it requires authentication, add middleware if needed)
router.get("/profile", userController.getUserProfile);
router.post("/forgot-password", userController.forgotPassword);
// router.post("/reset-password", userController.resetPassword);

module.exports = router;
