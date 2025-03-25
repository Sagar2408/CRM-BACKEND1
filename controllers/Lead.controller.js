const { Lead, Deal } = require("../config/sequelize");

// 📌 Get all leads
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      include: [{ model: Deal, attributes: ["revenue", "profit", "status"] }], // Include Deals
    });
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [{ model: Deal, attributes: ["revenue", "profit", "status"] }], // Include Deals
    });

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.status(200).json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Create a new lead
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, status, assignedToExecutive } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      status,
      assignedToExecutive,
    });
    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Update a lead
exports.updateLead = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    let lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    await lead.update({ name, email, phone, status });
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Delete a lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    await lead.destroy();
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.reassignLead = async (req, res) => {
  try {
    const { newExecutive } = req.body;
    const { id } = req.params;

    // Find the lead
    let lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Prevent duplicate assignment
    if (lead.assignedToExecutive === newExecutive) {
      return res
        .status(400)
        .json({ message: "Lead is already assigned to this executive" });
    }

    // Store the previous assignment in history
    await LeadAssignmentHistory.create({
      leadId: lead.id,
      assignedTo: lead.assignedToExecutive, // Store old executive
    });

    // Update the lead with the new executive
    await lead.update({
      previousAssignedTo: lead.assignedToExecutive, // Keep track of old executive
      assignedToExecutive: newExecutive,
      assignmentDate: new Date(),
    });

    res.status(200).json({ message: "Lead reassigned successfully", lead });
  } catch (error) {
    console.error("Error reassigning lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
