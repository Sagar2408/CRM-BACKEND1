const express = require("express");
const router = express.Router();
const { signupHr, loginHr , logoutHr} = require("../controllers/Hr.controller");

router.post("/signup", signupHr);
router.post("/login", loginHr);
router.post("/logout", logoutHr)

module.exports = router;
