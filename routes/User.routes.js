// routes/User.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/User.controller");
const auth = require("../middleware/auth");

// Public routes
router.post("/signup", userController.signupLocal);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Role-specific protected routes
router.get("/admin", auth(["Admin"]), userController.getAdminDashboard);
router.get("/tl", auth(["TL"]), userController.getTLDashboard);
router.get(
  "/executive",
  auth(["Executive"]),
  userController.getExecutiveDashboard
);

// General profile route (if still needed)
router.get("/profile", auth(), userController.getUserProfile); // No role restriction

module.exports = router;
