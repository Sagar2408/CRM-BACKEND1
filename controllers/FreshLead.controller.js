const db = require("../config/sequelize");
const { FreshLead, Lead, ClientLead } = db;

const createFreshLead = async (req, res) => {
  try {
    const { leadId } = req.body;

    // Check if the lead exists
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Find the associated client lead
    const clientLead = await ClientLead.findByPk(lead.clientLeadId);
    if (!clientLead) {
      return res.status(404).json({ error: "Client lead not found" });
    }

    // Create a new fresh lead
    const newFreshLead = await FreshLead.create({
      leadId: lead.id,
      name: clientLead.name,
      email: clientLead.email,
      phone: clientLead.phone,
      status: lead.status,
    });

    return res
      .status(201)
      .json({ message: "Fresh lead created", data: newFreshLead });
  } catch (error) {
    console.error("Error creating fresh lead:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createFreshLead,
};
