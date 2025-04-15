const { CloseLead, FreshLead } = require("../config/sequelize");

const createCloseLead = async (req, res) => {
  try {
    const { freshLeadId } = req.body;

    if (!freshLeadId) {
      return res.status(400).json({ message: "freshLeadId is required." });
    }

    // Fetch the FreshLead
    const freshLead = await FreshLead.findOne({
      where: { id: freshLeadId },
    });

    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found." });
    }

    // Check for existing CloseLead
    const existingCloseLead = await CloseLead.findOne({
      where: { freshLeadId },
    });

    if (existingCloseLead) {
      return res.status(409).json({
        message: "CloseLead already exists for this FreshLead.",
      });
    }

    // Destructure data from FreshLead
    const { name, phone, email } = freshLead;

    // Create CloseLead
    const closeLead = await CloseLead.create({
      freshLeadId,
      name,
      phone,
      email,
    });

    res.status(201).json({
      message: "CloseLead created successfully.",
      data: closeLead,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong.",
      error: err.message,
    });
  }
};
const getAllCloseLeads = async (req, res) => {
  try {
    const closeLeads = await CloseLead.findAll({
      include: {
        model: FreshLead,
        as: "freshLead",
        attributes: ["id", "name", "phone", "email"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "CloseLeads fetched successfully.",
      data: closeLeads,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong.",
      error: err.message,
    });
  }
};
const getCloseLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch CloseLead by ID
    const closeLead = await CloseLead.findByPk(id, {
      include: {
        model: FreshLead,
        as: "freshLead",
        attributes: ["id", "name", "phone", "email"],
      },
    });

    if (!closeLead) {
      return res.status(404).json({ message: "CloseLead not found." });
    }

    res.status(200).json({
      message: "CloseLead fetched successfully.",
      data: closeLead,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong.",
      error: err.message,
    });
  }
};
module.exports = {
  createCloseLead,
  getAllCloseLeads,
  getCloseLeadById,
};
