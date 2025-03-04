// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controller/User.controller");
const auth = require("../middleware/auth"); // Import authentication middleware


router.post("/signup", userController.signupLocal);
router.post("/login", userController.login); 

router.get("/profile", auth, async (req, res) => {
    try {
      const user = await userController.getUserProfile(req, res); // Use a function from the controller
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

router.get("/auth/twitter", userController.signupTwitter);
router.get("/auth/twitter/callback", userController.twitterCallback);

router.get("/auth/facebook", userController.signupFacebook);
router.get("/auth/facebook/callback", userController.facebookCallback);

router.get("/auth/linkedin", userController.signupLinkedin);
router.get("/auth/linkedin/callback", userController.linkedinCallback);

module.exports = router;
