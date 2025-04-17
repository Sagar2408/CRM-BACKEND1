const express = require("express");
const router = express.Router();

const {
  getExecutiveDashboardStats,getExecutiveFollowUpStats
} = require("../controllers/Executivedashboard.controller");

const auth = require("../middleware/auth");

// Protected route for executive dashboard (requires valid JWT & executive role)
router.get("/", auth(), getExecutiveDashboardStats);
router.get("/followupstats",auth(),getExecutiveFollowUpStats);

module.exports = router;
