const express = require("express");
const router = express.Router();
const {
  loginProcessPerson,
  signupProcessPerson,
} = require("../controllers/ProcessPerson.controller");

// Login Route
router.post("/login", loginProcessPerson);

// Signup Route
router.post("/signup", signupProcessPerson);

module.exports = router;
