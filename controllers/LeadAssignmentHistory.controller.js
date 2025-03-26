const { LeadAssignmentHistory } = require("../models/LeadAssignmentHistory");

// ✅ Save a new assignment history record
exports.createAssignmentHistory = async (leadId, assignedTo) => {
  try {
    await LeadAssignmentHistory.create({
      leadId,
      assignedTo,
    });
    console.log("Lead assignment history recorded.");
  } catch (error) {
    console.error("Error saving lead assignment history:", error);
  }
};
