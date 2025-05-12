const express = require("express");
const router = express.Router();
const {
  loginCustomer,
  signupCustomer,
} = require("../controllers/Customer.controller");

// Login Route
router.post("/login", loginCustomer);

// Signup Route
router.post("/signup", signupCustomer);

module.exports = router;
