const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  signupManager,
  loginManager,
  logoutManager,
  createTeam,
  getManagerTeams,
  addExecutiveToTeam,
  getManagerProfile,
  getAllManagers,
  toggleManagerLoginAccess,
  getAllTeamMember,
  getManagerById,
  updateManagerProfile,
  getManagerLoginStatus,
} = require("../controllers/Manager.controller");

router.post("/signup", signupManager);
router.post("/login", loginManager);
router.post("/logout", auth(), logoutManager);
router.post("/teams", auth(), createTeam);
router.get("/teams", auth(), getManagerTeams);
router.post("/addExecutive", auth(), addExecutiveToTeam);
router.get("/profile", auth(), getManagerProfile);
//fetch all managers
router.get("/", auth(), getAllManagers);
//toggle if manager can login or not
router.post("/toggle-login", auth(), toggleManagerLoginAccess);
//get managers login status
router.get("login-status/:id", auth(), getManagerLoginStatus);
//get all team members of a team
router.post("/get-team", auth(), getAllTeamMember);
//get manager by id
router.get("/:id", auth(), getManagerById);
//update manager profile
router.put("/:id", auth(), updateManagerProfile);

module.exports = router;
