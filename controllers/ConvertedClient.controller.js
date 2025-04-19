const {
  ConvertedClient,
  FreshLead,
  Lead,
  ClientLead,
} = require("../config/sequelize");

const createConvertedClient = async (req, res) => {
  try {
    const { fresh_lead_id } = req.body;

    if (!fresh_lead_id) {
      return res.status(400).json({ message: "fresh_lead_id is required." });
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
    const existingConvertedClient = await ConvertedClient.findOne({
      where: { fresh_lead_id },
    });

    if (existingConvertedClient) {
      return res.status(409).json({
        message: "A ConvertedClient already exists for this fresh_lead_id.",
        data: existingConvertedClient,
      });
    }

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
    const country = freshLead.lead.ClientLead.country || null;

    // Create ConvertedClient
    const convertedClient = await ConvertedClient.create({
      fresh_lead_id,
      name,
      phone,
      email,
      country,
      last_contacted: new Date(),
    });

    // Update ClientLead status to "Converted"
    await ClientLead.update(
      { status: "Converted" },
      {
        where: { id: freshLead.lead.clientLeadId },
      }
    );

    res.status(201).json({
      message: "Converted client created successfully.",
      data: convertedClient,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: err.message });
  }
};
// Get all converted clients
const getAllConvertedClients = async (req, res) => {
  try {
    const clients = await ConvertedClient.findAll();
    res.status(200).json({
      message: "All converted clients fetched successfully.",
      data: clients,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: err.message });
  }
};

// Get a single converted client by ID
const getConvertedClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await ConvertedClient.findByPk(id);

    if (!client) {
      return res.status(404).json({ message: "Converted client not found." });
    }

    res.status(200).json({
      message: "Converted client fetched successfully.",
      data: client,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: err.message });
  }
};

module.exports = {
  createConvertedClient,
  getAllConvertedClients,
  getConvertedClientById,
};
