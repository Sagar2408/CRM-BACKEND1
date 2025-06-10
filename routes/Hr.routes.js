const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  signupHr,
  loginHr,
  logoutHr,
  getHrProfile,
} = require("../controllers/Hr.controller");

router.post("/signup", signupHr);
router.post("/login", loginHr);
router.post("/logout", logoutHr);
router.get("/profile", auth(), getHrProfile);

module.exports = router;
