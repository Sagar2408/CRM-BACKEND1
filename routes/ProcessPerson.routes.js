const express = require("express");
const router = express.Router();
const {
  loginProcessPerson,
  signupProcessPerson,
  logoutProcessPerson,
  getAllConvertedClients,
} = require("../controllers/ProcessPerson.controller");
const auth = require("../middleware/auth");

// Login Route
router.post("/login", loginProcessPerson);

// Signup Route
router.post("/signup", signupProcessPerson);

router.post("/logout", auth(), logoutProcessPerson);

router.get("/convertedclients", auth(), getAllConvertedClients);

module.exports = router;
