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
        as: "Lead",
        include: {
          model: ClientLead,
          as: "ClientLead",
        },
      },
    });

    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found." });
    }

    const { name, phone, email } = freshLead;
    const country = freshLead.Lead?.ClientLead?.country || null;

    const convertedClient = await ConvertedClient.create({
      fresh_lead_id,
      name,
      phone,
      email,
      country,
      last_contacted: new Date(),
    });

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
