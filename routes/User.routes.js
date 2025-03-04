// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controller/User.controller");

router.post("/signup", userController.signupLocal);

// Twitter routes
router.get("/auth/twitter/signup", userController.signupTwitter);
router.get("/auth/twitter/callback", userController.twitterCallback);

// Facebook routes
router.get("/auth/facebook", userController.signupFacebook);
router.get("/auth/facebook/callback", userController.facebookCallback);

// LinkedIn routes
router.get("/auth/linkedin", userController.signupLinkedin);
router.get("/auth/linkedin/callback", userController.linkedinCallback);

module.exports = router;
