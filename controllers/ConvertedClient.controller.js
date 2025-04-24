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
          as: "clientLead", // Corrected alias to match association
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
    if (!freshLead.lead || !freshLead.lead.clientLead) {
      return res
        .status(404)
        .json({ message: "Lead or ClientLead not found for this FreshLead." });
    }

    const { name, phone, email } = freshLead;
    const country = freshLead.lead.clientLead.country || null; // Updated to use clientLead

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

const getConvertedClientByExecutive = async (req, res) => {
  try {
    // Extract executive name from req.user (set by auth middleware)
    const executiveName = req.user.username; // Adjust based on your token payload
    console.log("Executive Name:", executiveName); // Debug the executive name

    if (!executiveName) {
      return res
        .status(400)
        .json({ message: "Executive name not found in token." });
    }

    // Query ConvertedClient with associated FreshLead, Lead, and ClientLead
    const clients = await ConvertedClient.findAll({
      include: [
        {
          model: FreshLead,
          as: "freshLead",
          required: true, // Require FreshLead to exist
          include: [
            {
              model: Lead,
              as: "lead",
              required: true, // Require Lead to exist
              include: [
                {
                  model: ClientLead,
                  as: "clientLead",
                  required: true, // Require ClientLead to exist and match the condition
                  where: { assignedToExecutive: executiveName },
                  attributes: ["status"],
                },
              ],
            },
          ],
        },
      ],
    });

    // Check if any clients were found
    if (!clients || clients.length === 0) {
      return res.status(404).json({
        message: "No converted clients found for this executive.",
      });
    }

    // Format response to include status
    const formattedClients = clients.map((client) => ({
      id: client.id,
      fresh_lead_id: client.fresh_lead_id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      country: client.country,
      last_contacted: client.last_contacted,
      status: client.freshLead?.lead?.clientLead?.status || "Unknown",
    }));

    res.status(200).json({
      message: "Converted clients fetched successfully.",
      data: formattedClients,
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
  createConvertedClient,
  getAllConvertedClients,
  getConvertedClientById,
  getConvertedClientByExecutive,
};
