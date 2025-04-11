const db = require("../config/sequelize");
const FollowUp = db.FollowUp;


// Create Follow Up
exports.createFollowUp = async (req, res) => {
  try {
    const {
      connect_via,
      follow_up_type,
      interaction_rating,
      reason_for_follow_up,
      follow_up_date,
      follow_up_time
    } = req.body;

    const followUp = await FollowUp.create({
      connect_via,
      follow_up_type,
      interaction_rating,
      reason_for_follow_up,
      follow_up_date,
      follow_up_time
    });

    res.status(201).json({ message: 'Follow up created successfully', followUp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating follow up', error });
  }
};

// Get All Follow Ups
exports.getAllFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.findAll();
    res.status(200).json(followUps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching follow ups', error });
  }
};


