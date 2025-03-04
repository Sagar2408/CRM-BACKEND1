// routes/User.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controller/User.controller");

// Local signup and login routes
router.post("/signup", userController.signupLocal);
router.post("/login", userController.login);

// User profile route (assuming it requires authentication, add middleware if needed)
router.get("/profile", userController.getUserProfile);

// Twitter signup routes
router.get("/auth/twitter/signup", userController.signupTwitter);
router.get("/auth/twitter/callback", userController.twitterCallback);

// Optional: Keep or remove other routes (e.g., Twitter login, Facebook, LinkedIn)
// ... other routes (e.g., Facebook, LinkedIn) if needed

module.exports = router;
