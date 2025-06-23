const createProcessFollowUp = async (req, res) => {
  try {
    const { ProcessFollowUpHistory, FreshLead, ConvertedClient } = req.db;
    const {
      fresh_lead_id,
      connect_via,
      follow_up_type,
      interaction_rating,
      follow_up_date,
      follow_up_time,
      comments,
    } = req.body;
    console.log(req.body);

    // Ensure fresh_lead_id is provided
    if (!fresh_lead_id) {
      return res.status(400).json({ message: "fresh_lead_id is required." });
    }

    // Confirm fresh lead exists
    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found." });
    }

    // Business logic: must be a converted lead
    const converted = await ConvertedClient.findOne({
      where: { fresh_lead_id },
    });

    if (!converted) {
      return res.status(400).json({
        message:
          "This lead is not converted yet. Process follow-up not allowed.",
      });
    }

    // Extract logged-in process person ID
    const process_person_id = req.user?.id;

    if (!process_person_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: process person not found." });
    }

    const followUp = await ProcessFollowUpHistory.create({
      fresh_lead_id,
      process_person_id,
      connect_via,
      follow_up_type,
      interaction_rating,
      follow_up_date,
      follow_up_time,
      comments,
    });

    res.status(201).json({
      message: "Process follow-up recorded successfully.",
      data: followUp,
    });
  } catch (err) {
    console.error("Error saving process follow-up:", err);
    res.status(500).json({
      message: "Something went wrong.",
      error: err.message,
    });
  }
};

const getProcessFollowUpsByFreshLeadId = async (req, res) => {
  try {
    const { ProcessFollowUpHistory, FreshLead } = req.db;
    const { fresh_lead_id } = req.params;

    if (!fresh_lead_id) {
      return res
        .status(400)
        .json({ message: "fresh_lead_id is required in the URL." });
    }

    // Optional: Validate if the lead exists
    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found." });
    }

    const followUps = await ProcessFollowUpHistory.findAll({
      where: { fresh_lead_id },
      order: [
        ["follow_up_date", "DESC"],
        ["follow_up_time", "DESC"],
      ],
    });

    if (!followUps.length) {
      return res.status(404).json({
        message: "No process follow-up history found for this FreshLead.",
      });
    }

    res.status(200).json({
      message: "Process follow-up history retrieved successfully.",
      data: followUps,
    });
  } catch (err) {
    console.error("Error fetching process follow-up history:", err);
    res.status(500).json({
      message: "Something went wrong.",
      error: err.message,
    });
  }
};

const getAllProcessFollowups = async (req, res) => {
  try {
    const { ProcessFollowUpHistory, FreshLead, Lead, ClientLead } = req.db;
    const process_person_id = req.user?.id;

    if (!process_person_id) {
      return res.status(401).json({
        message: "Unauthorized: process person not found.",
      });
    }

    // Find all distinct fresh_lead_ids for this process_person
    const allFollowUps = await ProcessFollowUpHistory.findAll({
      where: { process_person_id },
      attributes: ["fresh_lead_id"],
      group: ["fresh_lead_id"],
    });

    const freshLeadIds = allFollowUps.map((item) => item.fresh_lead_id);

    if (freshLeadIds.length === 0) {
      return res.status(404).json({
        message: "No follow-ups found for this process person.",
      });
    }

    const latestFollowUps = [];

    //For each fresh_lead_id, fetch latest follow-up and attach lead info
    for (const freshLeadId of freshLeadIds) {
      const latest = await ProcessFollowUpHistory.findOne({
        where: {
          fresh_lead_id: freshLeadId,
          process_person_id,
        },
        order: [
          ["follow_up_date", "DESC"],
          ["follow_up_time", "DESC"],
          ["createdAt", "DESC"],
        ],
        include: [
          {
            model: FreshLead,
            as: "freshLead",
            attributes: ["name", "phone", "email", "leadId"],
            include: [
              {
                model: Lead,
                as: "lead",
                attributes: ["clientLeadId"],
                include: [
                  {
                    model: ClientLead,
                    as: "clientLead",
                    attributes: ["status"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (latest) latestFollowUps.push(latest);
    }

    return res.status(200).json({
      message: "Latest follow-ups retrieved successfully.",
      data: latestFollowUps,
    });
  } catch (error) {
    console.error("❌ Error fetching latest follow-ups:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProcessFollowUp,
  getProcessFollowUpsByFreshLeadId,
  getAllProcessFollowups,
};
