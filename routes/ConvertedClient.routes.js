const express = require("express");
const router = express.Router();
const ConvertedClientController = require("../controllers/ConvertedClient.controller");

// Create a ConvertedClient using fresh_lead_id
router.post("/", ConvertedClientController.createConvertedClient);
router.get("/", ConvertedClientController.getAllConvertedClients);
router.get("/:id", ConvertedClientController.getConvertedClientById);

module.exports = router;
