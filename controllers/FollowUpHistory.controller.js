const {
  FollowUpHistory,
  FollowUp,
  FreshLead,
  Lead,
} = require("../config/sequelize");
const { Op } = require("sequelize");

// Create a new FollowUpHistory record
exports.createFollowUpHistory = async (req, res) => {
  try {
    const {
      follow_up_id,
      connect_via,
      follow_up_type,
      interaction_rating,
      reason_for_follow_up,
      follow_up_date,
      follow_up_time,
      fresh_lead_id,
    } = req.body;

    // Validate required fields
    if (
      !follow_up_id ||
      !connect_via ||
      !follow_up_type ||
      !interaction_rating ||
      !reason_for_follow_up ||
      !follow_up_date ||
      !follow_up_time ||
      !fresh_lead_id
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if FollowUp exists
    const followUp = await FollowUp.findByPk(follow_up_id);
    if (!followUp) {
      return res.status(404).json({ error: "FollowUp not found" });
    }

    // Check if FreshLead exists
    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead) {
      return res.status(404).json({ error: "FreshLead not found" });
    }

    // Create FollowUpHistory record
    const followUpHistory = await FollowUpHistory.create({
      follow_up_id,
      connect_via,
      follow_up_type,
      interaction_rating,
      reason_for_follow_up,
      follow_up_date,
      follow_up_time,
      fresh_lead_id,
    });

    return res.status(201).json({
      message: "FollowUpHistory created successfully",
      followUpHistory,
    });
  } catch (error) {
    console.error("Error creating FollowUpHistory:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all FollowUpHistory records
exports.getFollowUpHistoriesByExecutive = async (req, res) => {
  try {
    // Extract username from the token (assuming auth middleware adds it to req.user)
    const username = req.user.username;

    if (!username) {
      return res.status(400).json({ error: "Username not found in token" });
    }

    // Fetch FollowUpHistory records by joining with FreshLead and Lead
    const followUpHistories = await FollowUpHistory.findAll({
      include: [
        {
          model: FollowUp,
          as: "followUp",
        },
        {
          model: FreshLead,
          as: "freshLead",
          include: [
            {
              model: Lead,
              as: "lead",
              where: {
                assignedToExecutive: username, // Filter by executive username
              },
            },
          ],
        },
      ],
    });

    if (!followUpHistories.length) {
      return res
        .status(404)
        .json({ error: "No follow-up history found for this executive" });
    }

    return res.status(200).json(followUpHistories);
  } catch (error) {
    console.error("Error fetching FollowUpHistories by executive:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
