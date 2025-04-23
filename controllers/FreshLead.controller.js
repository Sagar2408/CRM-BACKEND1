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

const updateFollowUp = async (req, res) => {
  const { id } = req.params;
  const { followUpDate, followUpStatus } = req.body;

  try {
    const lead = await FreshLead.findByPk(id);
    if (!lead) {
      return res.status(404).json({ error: "FreshLead not found" });
    }

    if (followUpDate !== undefined) lead.followUpDate = followUpDate;
    if (followUpStatus !== undefined) lead.followUpStatus = followUpStatus;

    await lead.save();

    return res.json({ message: "Follow-up updated successfully", data: lead });
  } catch (error) {
    console.error("Error updating follow-up:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getFreshLeadsByExecutive = async (req, res) => {
  const executiveUsername = req.user?.username; // assuming middleware sets this from token

  if (!executiveUsername) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Executive username missing in token" });
  }

  try {
    const freshLeads = await db.FreshLead.findAll({
      include: [
        {
          model: db.Lead,
          as: "lead", // must match your alias
          where: { assignedToExecutive: executiveUsername },
          attributes: ["assignedToExecutive", "status", "assignmentDate"],
        },
      ],
    });

    if (freshLeads.length === 0) {
      return res
        .status(404)
        .json({ message: "No fresh leads found for this executive" });
    }

    return res.status(200).json({ data: freshLeads });
  } catch (error) {
    console.error("Error fetching fresh leads by executive:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createFreshLead,
  updateFollowUp,
  getFreshLeadsByExecutive,
};
