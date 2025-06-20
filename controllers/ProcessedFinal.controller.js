const createFinalizedLead = async (req, res) => {
  try {
    const { ProcessedFinal, FreshLead } = req.db;
    const { fresh_lead_id } = req.body;

    // Extract logged-in process person ID
    const process_person_id = req.user?.id;

    if (!process_person_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: process person not found." });
    }

    // Ensure fresh_lead_id is provided
    if (!fresh_lead_id) {
      return res.status(400).json({ message: "fresh_lead_id is required." });
    }

    // Confirm fresh lead exists
    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found." });
    }

    // Must be a closed lead
    if (freshLead.followUpStatus !== "close") {
      return res.status(400).json({ message: "Fresh lead is not closed" });
    }

    // Prevent duplicate ProcessedFinal entry
    const exists = await ProcessedFinal.findOne({
      where: { freshLeadId: fresh_lead_id },
    });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Already processed final for this lead" });
    }

    // Create new ProcessedFinal entry
    const finalEntry = await ProcessedFinal.create({
      freshLeadId: fresh_lead_id,
      process_person_id,
      name: freshLead.name,
      phone: freshLead.phone,
      email: freshLead.email,
    });

    return res.status(201).json({
      message: "ProcessedFinal entry created successfully",
      data: finalEntry,
    });
  } catch (error) {
    console.error("❌ Error creating ProcessedFinal:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getFinalizedLead = async (req, res) => {};

module.exports = {
  createFinalizedLead,
  getFinalizedLead,
};
