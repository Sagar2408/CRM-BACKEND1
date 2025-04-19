const {
  CloseLead,
  FreshLead,
  ClientLead,
  Lead,
} = require("../config/sequelize");

const createCloseLead = async (req, res) => {
  try {
    const { fresh_lead_id } = req.body;

    if (!fresh_lead_id) {
      return res.status(400).json({ message: "fresh_lead_id is required." });
    }

    // Check if a CloseLead already exists for the fresh_lead_id
    const existingCloseLead = await CloseLead.findOne({
      where: { freshLeadId: fresh_lead_id },
    });

    if (existingCloseLead) {
      return res.status(409).json({
        message: "A CloseLead already exists for this fresh_lead_id.",
        data: existingCloseLead,
      });
    }

    // Get FreshLead with related Lead and ClientLead
    const freshLead = await FreshLead.findOne({
      where: { id: fresh_lead_id },
      include: {
        model: Lead,
        as: "lead", // Match the association alias (lowercase 'lead')
        include: {
          model: ClientLead,
          as: "ClientLead", // Match the association alias
        },
      },
    });

    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found." });
    }

    // Check if Lead and ClientLead exist
    if (!freshLead.lead || !freshLead.lead.ClientLead) {
      return res
        .status(404)
        .json({ message: "Lead or ClientLead not found for this FreshLead." });
    }

    const { name, phone, email } = freshLead;

    // Create CloseLead
    const closeLead = await CloseLead.create({
      freshLeadId: fresh_lead_id,
      name,
      phone,
      email,
    });

    // Update ClientLead status to "Closed"
    await ClientLead.update(
      { status: "Closed" },
      {
        where: { id: freshLead.lead.clientLeadId },
      }
    );

    res.status(201).json({
      message: "CloseLead created successfully.",
      data: closeLead,
    });
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "A CloseLead already exists for this fresh_lead_id.",
        error: err.message,
      });
    }
    if (
      err.name === "SequelizeDatabaseError" &&
      err.original?.sqlMessage?.includes("Data truncated")
    ) {
      return res.status(500).json({
        message:
          "Invalid status value for ClientLead. Please check the database schema.",
        error: err.message,
      });
    }
    res
      .status(500)
      .json({ message: "Something went wrong.", error: err.message });
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
