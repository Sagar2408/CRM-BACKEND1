const { Sequelize } = require("sequelize");

const getExecutiveStats = async (req, res) => {
  try {
    const { FreshLead, FollowUp, ConvertedClient, Lead, ClientLead } = req.db;
    const executiveName = req.user.username;

    if (!executiveName) {
      return res.status(400).json({
        success: false,
        message: "Executive name missing from token.",
      });
    }

    let freshLeadsCount = 0;
    let followUpsCount = 0;
    let convertedClientCount = 0;

    // ✅ Fresh Leads: ClientLead.status = "New" or "Assigned"
    try {
      freshLeadsCount = await FreshLead.count({
        include: [
          {
            model: Lead,
            as: "lead",
            required: true,
            include: [
              {
                model: ClientLead,
                as: "clientLead",
                where: {
                  assignedToExecutive: executiveName,
                  status: { [Sequelize.Op.in]: ["New", "Assigned"] },
                },
                required: true,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error counting FreshLeads:", error);
    }

    // ✅ Follow Ups: ClientLead.status = "Follow-Up"
    try {
      followUpsCount = await FollowUp.count({
        include: [
          {
            model: FreshLead,
            as: "freshLead",
            required: true,
            include: [
              {
                model: Lead,
                as: "lead",
                required: true,
                include: [
                  {
                    model: ClientLead,
                    as: "clientLead",
                    where: {
                      assignedToExecutive: executiveName,
                      status: "Follow-Up",
                    },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error counting FollowUps:", error);
    }

    // ✅ Converted Clients: ClientLead.status = "Converted"
    try {
      convertedClientCount = await ConvertedClient.count({
        include: [
          {
            model: FreshLead,
            as: "freshLead",
            required: true,
            include: [
              {
                model: Lead,
                as: "lead",
                required: true,
                include: [
                  {
                    model: ClientLead,
                    as: "clientLead",
                    where: {
                      assignedToExecutive: executiveName,
                      status: "Converted",
                    },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error counting ConvertedClients:", error);
    }

    res.status(200).json({
      success: true,
      data: {
        freshLeads: freshLeadsCount,
        followUps: followUpsCount,
        convertedClients: convertedClientCount,
      },
    });
  } catch (error) {
    console.error("Executive stats error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports = {
  getExecutiveStats,
};
