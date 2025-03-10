const express = require("express");
const multer = require("multer");
const router = express.Router();
const clientLeadController = require("../controllers/ClientLead.controller");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Route to upload Excel file
router.post(
  "/upload",
  upload.single("file"),
  clientLeadController.uploadClientLeads
);

module.exports = router;
