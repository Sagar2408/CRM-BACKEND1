const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  signupHr,
  loginHr,
  logoutHr,
  getHrProfile,
  getAllHrs,
  toggleHrLoginAccess,
} = require("../controllers/Hr.controller");

router.post("/signup", signupHr);
router.post("/login", loginHr);
router.post("/logout", logoutHr);
router.get("/profile", auth(), getHrProfile);
router.post("/toggle-login", auth(), toggleHrLoginAccess);
router.get("/", auth(), getAllHrs);

module.exports = router;
