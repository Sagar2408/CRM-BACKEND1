const express = require("express");
const router = express.Router();
const {
  loginCustomer,
  signupCustomer,
  logoutCustomer,
  getAllCustomers,
  markAsUnderReview,
  markAsApproved,
  markAsRejected,
  markAsMeeting,
} = require("../controllers/Customer.controller");
const auth = require("../middleware/auth");

// Login Route
router.post("/login", loginCustomer);

// Signup Route
router.post("/signup", signupCustomer);

// Logout Route
router.post("/logout", auth(), logoutCustomer);

router.get("/getAllCustomer", getAllCustomers);

router.put("/status/under_review", auth(), markAsUnderReview);
router.put("/status/approved", auth(), markAsApproved);
router.put("/status/rejected", auth(), markAsRejected);
router.put("/status/meeting", auth(), markAsMeeting);

module.exports = router;
