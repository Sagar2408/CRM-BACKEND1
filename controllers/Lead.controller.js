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
    const { leadId } = req.params; // Ensure this is passed correctly
    const lead = await Lead.findByPk(leadId);

    if (!lead) {
      return res
        .status(404)
        .json({ message: `Lead with ID ${leadId} not found` });
    }

    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Create a new lead
exports.createLead = async (req, res) => {
  try {
    const { email, phone, status, assignedToExecutive, clientLeadId } =
      req.body;

    // Validate required fields
    if (!clientLeadId || !assignedToExecutive) {
      return res.status(400).json({
        message: "clientLeadId and assignedToExecutive are required.",
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      status: status || "Assigned", // Default status if not provided
      assignedToExecutive,
      clientLeadId,
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message:
          "Lead with this clientLeadId is already assigned to this executive.",
      });
    }

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
    const { leadId, newExecutive } = req.body;

    // Find the lead
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Save previous executive (make sure this is captured before any updates)
    const previousAssignedTo = lead.assignedToExecutive;

    // Update the lead with a new executive
    lead.assignedToExecutive = newExecutive;
    await lead.save();

    // Return the lead with the previousAssignedTo explicitly included
    res.json({
      message: "Lead reassigned successfully",
      lead: {
        ...lead.toJSON(), // Spread the lead object's attributes
        previousAssignedTo: previousAssignedTo, // Explicitly add the previous executive
      },
    });
  } catch (error) {
    console.error("Error reassigning lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
