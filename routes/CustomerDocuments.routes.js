const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const customerDocController = require("../controllers/CustomerDocument.controller");

// Route for uploading documents
router.post("/upload", customerDocController.uploadDocuments);

// Get documents by customerId
router.get("/document", auth(), customerDocController.getDocumentsByCustomerId);

module.exports = router;
