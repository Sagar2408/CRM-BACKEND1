const express = require("express");
const router = express.Router();
const {
  createCustomerStages,
  getCustomerStages,
  updateCustomerStages,
  getCustomerStagesById,
  addStageComment,
  getStageComments,
} = require("../controllers/CustomerStages.controller");

router.post("/stages", createCustomerStages);
router.get("/stages", getCustomerStages);
router.put("/stages", updateCustomerStages);
router.get("/customer-stages/:customerId", getCustomerStagesById);

//To add multiple comments on a single stage
router.post("/stage-comment/add", addStageComment);

//To Fetch all the comments on a single stage
router.get("/stage-comment/get", getStageComments);

module.exports = router;
