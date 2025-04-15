const db = require("../config/sequelize"); // Import the database connection and models
const { FollowUp, FreshLead } = db; // Destructure the required models

// Controller to create a new FollowUp record
const createFollowUp = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      connect_via,
      follow_up_type,
      interaction_rating,
      reason_for_follow_up,
      follow_up_date,
      follow_up_time,
      fresh_lead_id, // FreshLead ID should be provided
    } = req.body;

    // Validate input data (simple validation)
    if (
      !connect_via ||
      !follow_up_type ||
      !interaction_rating ||
      !reason_for_follow_up ||
      !follow_up_date ||
      !follow_up_time ||
      !fresh_lead_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the FreshLead ID exists in the database
    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found" });
    }

    // Create a new FollowUp record
    const newFollowUp = await FollowUp.create({
      connect_via,
      follow_up_type,
      interaction_rating,
      reason_for_follow_up,
      follow_up_date,
      follow_up_time,
      fresh_lead_id, // Associating the FollowUp with FreshLead
    });

    // Return the created FollowUp data as a response
    return res
      .status(201)
      .json({ message: "Follow-up created successfully", data: newFollowUp });
  } catch (err) {
    console.error("Error creating FollowUp:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params; // Get the FollowUp ID from the URL parameters
    const {
      connect_via,
      follow_up_type,
      interaction_rating,
      reason_for_follow_up,
      follow_up_date,
      follow_up_time,
      fresh_lead_id, // FreshLead ID should be provided for the association
    } = req.body;

    // Validate input data (simple validation)
    if (
      !connect_via ||
      !follow_up_type ||
      !interaction_rating ||
      !reason_for_follow_up ||
      !follow_up_date ||
      !follow_up_time ||
      !fresh_lead_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the FreshLead ID exists in the database
    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found" });
    }

    // Find the FollowUp record by ID
    const followUp = await FollowUp.findByPk(id);
    if (!followUp) {
      return res.status(404).json({ message: "FollowUp not found" });
    }

    // Update the FollowUp record with new data
    followUp.connect_via = connect_via;
    followUp.follow_up_type = follow_up_type;
    followUp.interaction_rating = interaction_rating;
    followUp.reason_for_follow_up = reason_for_follow_up;
    followUp.follow_up_date = follow_up_date;
    followUp.follow_up_time = follow_up_time;
    followUp.fresh_lead_id = fresh_lead_id;

    // Save the updated record
    await followUp.save();

    // Return the updated FollowUp data as a response
    return res
      .status(200)
      .json({ message: "Follow-up updated successfully", data: followUp });
  } catch (err) {
    console.error("Error updating FollowUp:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Export the controller functions
module.exports = {
  createFollowUp,
  updateFollowUp,
};
