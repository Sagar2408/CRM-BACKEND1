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
} = require("../controllers/Manager.controller");

router.post("/signup", signupManager);
router.post("/login", loginManager);
router.post("/logout", auth(), logoutManager);
router.post("/teams", auth(), createTeam);
router.get("/teams", auth(), getManagerTeams);
router.post("/addExecutive", auth(), addExecutiveToTeam);
router.get("/profile", auth(), getManagerProfile);
router.get("/", auth(), getAllManagers);
router.post("/toggle-login", auth(), toggleManagerLoginAccess);
router.post("/get-team", auth(), getAllTeamMember);
router.get("/:id", auth(), getManagerById);

module.exports = router;
