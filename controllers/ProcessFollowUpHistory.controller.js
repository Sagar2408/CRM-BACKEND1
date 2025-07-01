const createProcessFollowUp = async (req, res) => {
  try {
    const { ProcessFollowUpHistory, FreshLead, ConvertedClient, Customer } =
      req.db;
    const {
      fresh_lead_id,
      connect_via,
      follow_up_type,
      interaction_rating,
      follow_up_date,
      follow_up_time,
      comments,
    } = req.body;
    //console.log(req.body);

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

    // ✅ Update customer status to "under_review" for the same fresh_lead_id
    const customer = await Customer.findOne({ where: { fresh_lead_id } });
    if (customer) {
      customer.status = "under_review";
      await customer.save();
    }

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
    const { ProcessFollowUpHistory, FreshLead, Customer, Lead, ClientLead } =
      req.db;
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
        ["createdAt", "DESC"],
      ],
      include: [
        {
          model: FreshLead,
          as: "freshLead",
          attributes: ["name", "phone", "email"],
          include: [
            {
              model: Lead,
              as: "lead",
              attributes: ["id"],
              include: [
                {
                  model: ClientLead,
                  as: "clientLead",
                  attributes: ["education", "experience", "state", "dob"],
                },
              ],
            },
            {
              model: Customer,
              as: "customer",
              attributes: ["status"],
            },
          ],
        },
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
    const { ProcessFollowUpHistory, FreshLead, Customer } = req.db;
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
            attributes: ["name", "phone", "email"],
            include: [
              {
                model: Customer,
                as: "customer",
                attributes: ["status"],
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

const moveToRejected = async (req, res) => {
  try {
    const { ProcessFollowUpHistory, FreshLead, Customer } = req.db;

    const {
      fresh_lead_id,
      connect_via,
      follow_up_type,
      interaction_rating,
      follow_up_date,
      follow_up_time,
      comments,
    } = req.body;

    // Ensure fresh_lead_id is provided
    if (!fresh_lead_id) {
      return res.status(400).json({ message: "fresh_lead_id is required." });
    }

    // Confirm fresh lead exists
    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead) {
      return res.status(404).json({ message: "FreshLead not found." });
    }

    // Extract logged-in process person ID
    const process_person_id = req.user?.id;

    if (!process_person_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: process person not found." });
    }

    // Save follow-up entry
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

    // ✅ Update customer status to "rejected" for the same fresh_lead_id
    const customer = await Customer.findOne({ where: { fresh_lead_id } });
    if (customer) {
      customer.status = "rejected";
      await customer.save();
    }

    res.status(201).json({
      message:
        "Process follow-up recorded successfully and customer marked as rejected.",
      data: followUp,
    });
  } catch (error) {
    console.error("Error moving to Rejected", error); // ✅ use the correct variable
    res.status(500).json({
      message: "Something went wrong.",
      error: error.message, // ✅ fixed
    });
  }
};

const createMeetingForProcessPerson = async (req, res) => {
  const {
    Meeting,
    FreshLead,
    Lead,
    ClientLead,
    Customer,
    ProcessFollowUpHistory,
  } = req.db;

  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      reasonForFollowup,
      startTime,
      endTime,
      fresh_lead_id,
      connect_via,
      follow_up_type,
      interaction_rating,
      follow_up_date,
      follow_up_time,
    } = req.body;

    const processPersonId = req.user?.id;

    if (
      !clientName ||
      !clientEmail ||
      !clientPhone ||
      !startTime ||
      !fresh_lead_id
    ) {
      return res.status(400).json({
        message:
          "clientName, clientEmail, clientPhone, startTime, and fresh_lead_id are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime()) || startDate < new Date()) {
      return res.status(400).json({ message: "Invalid or past startTime" });
    }

    if (endTime) {
      const endDate = new Date(endTime);
      if (isNaN(endDate.getTime()) || endDate <= startDate) {
        return res
          .status(400)
          .json({ message: "endTime must be after startTime" });
      }
    }

    const freshLead = await FreshLead.findByPk(fresh_lead_id);
    if (!freshLead)
      return res.status(404).json({ message: "FreshLead not found" });

    const lead = await Lead.findByPk(freshLead.leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const clientLead = await ClientLead.findByPk(lead.clientLeadId);
    if (!clientLead)
      return res.status(404).json({ message: "ClientLead not found" });

    const transaction = await Meeting.sequelize.transaction();
    try {
      await clientLead.update({ status: "Meeting" }, { transaction });

      const meeting = await Meeting.create(
        {
          clientName,
          clientEmail,
          clientPhone,
          reasonForFollowup,
          startTime,
          endTime,
          processPersonId,
          fresh_lead_id,
        },
        { transaction }
      );

      await ProcessFollowUpHistory.create(
        {
          fresh_lead_id,
          process_person_id: processPersonId,
          connect_via,
          follow_up_type,
          interaction_rating,
          follow_up_date,
          follow_up_time,
          comments: reasonForFollowup,
        },
        { transaction }
      );

      const customer = await Customer.findOne({
        where: { fresh_lead_id },
        transaction,
      });

      if (customer) {
        customer.status = "meeting";
        await customer.save({ transaction });
      }

      await transaction.commit();

      // const customer = await Customer.findOne({ where: { fresh_lead_id } });
      // if (customer) {
      //   customer.status = "meeting";
      //   await customer.save();
      // }

      res.status(201).json({
        message: "Meeting created successfully for process person",
        data: meeting,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error creating meeting for process person:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message, // ✅ this reveals the error in the response
      stack: error.stack,
    });
  }
};

const getProcessPersonMeetings = async (req, res) => {
  try {
    const { Meeting, FreshLead, Customer } = req.db; // ✅ also include Customer here
    const processPersonId = req.user?.id;

    if (!processPersonId) {
      return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }

    const meetings = await Meeting.findAll({
      where: { processPersonId },
      include: [
        {
          model: FreshLead,
          as: "freshLead",
          include: [
            {
              model: Customer,
              as: "customer",
              attributes: ["status"],
            },
          ],
        },
      ],
      order: [["startTime", "ASC"]], // ✅ missing comma added here
    });

    return res.status(200).json({ meetings });
  } catch (error) {
    console.error("Fetch meetings error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createProcessFollowUp,
  getProcessFollowUpsByFreshLeadId,
  getAllProcessFollowups,
  moveToRejected,
  createMeetingForProcessPerson,
  getProcessPersonMeetings,
};
