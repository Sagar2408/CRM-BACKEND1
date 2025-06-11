const express = require("express");
const router = express.Router();
const customerDocController = require("../controllers/CustomerDocument.controller");

// Route for uploading documents
router.post("/upload", customerDocController.uploadDocuments);

// Get documents by customerId
router.get("/:customerId", customerDocController.getDocumentsByCustomerId);

module.exports = router;
