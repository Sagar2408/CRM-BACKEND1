const express = require("express");
const router = express.Router();
const {
  upload,
  uploadFile,
  getClientLeads,
} = require("../controllers/ClientLead.controller");

router.post("/upload", upload.single("file"), uploadFile);
router.get("/getClients", getClientLeads);

module.exports = router;
