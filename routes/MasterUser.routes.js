const express = require("express");
const router = express.Router();
const {
  signupMasterUser,
  loginMasterUser,
} = require("../controllers/MasterUser.controller");

// Public routes for MasterUser
router.post("/signup", signupMasterUser);
router.post("/login", loginMasterUser);

// (Optional) You can add a logout route here if needed in future

module.exports = router;
