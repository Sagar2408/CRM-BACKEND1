const express = require("express");
const router = express.Router();
const {
  loginProcessPerson,
  signupProcessPerson,
  logoutProcessPerson,
  getAllConvertedClients,
  importConvertedClientsToCustomers,
  getProcessSettings,
  updateProcessSettings,
  getAllProcessPersons,
  toggleProcessPersonLoginAccess,
  getProcessPersonById,
} = require("../controllers/ProcessPerson.controller");
const auth = require("../middleware/auth");

// Login Route
router.post("/login", loginProcessPerson);

// Signup Route
router.post("/signup", signupProcessPerson);

router.post("/logout", auth(), logoutProcessPerson);

router.get("/convertedclients", auth(), getAllConvertedClients);

router.post("/import-converted-customer", importConvertedClientsToCustomers);

router.get("/process/settings", auth(), getProcessSettings);
router.put("/process/settings", auth(), updateProcessSettings);
router.post("/toggle-login", auth(), toggleProcessPersonLoginAccess);
router.get("/", auth(), getAllProcessPersons);
router.get("/:id", auth(), getProcessPersonById);

module.exports = router;
