const {
  FreshLead,
  Lead,
  ConvertedClient,
  FollowUp,
} = require("../config/sequelize");

const getExecutiveDashboardStats = async (req, res) => {
  try {
    const executiveName = req.user.username;

    if (!executiveName) {
      return res.status(400).json({
        success: false,
        message: "Executive name missing from token.",
      });
    }

    // Count fresh leads
    let freshLeadsCount = 0;
    try {
      freshLeadsCount =
        (await FreshLead.count({
          include: [
            {
              model: Lead,
              as: "lead",
              where: { assignedToExecutive: executiveName },
            },
          ],
        })) || 0;
      console.log(`FreshLeadsCount for ${executiveName}:`, freshLeadsCount);
    } catch (freshLeadError) {
      console.error(
        `Error counting FreshLeads for ${executiveName}:`,
        freshLeadError
      );
      freshLeadsCount = 0; // Fallback to 0
    }

    // Respond with data
    res.status(200).json({
      success: true,
      data: {
        freshLeads: freshLeadsCount,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getExecutiveFollowUpStats = async (req, res) => {
  try {
    const executiveName = req.user.username;

    if (!executiveName) {
      return res.status(400).json({
        success: false,
        message: "Executive name missing from token.",
      });
    }

    // Count follow-ups
    let followUpsCount = 0;
    try {
      followUpsCount =
        (await FollowUp.count({
          include: [
            {
              model: FreshLead,
              as: "freshLead",
              include: [
                {
                  model: Lead,
                  as: "lead",
                  where: { assignedToExecutive: executiveName },
                },
              ],
            },
          ],
        })) || 0;
      console.log(`FollowUpsCount for ${executiveName}:`, followUpsCount);
    } catch (followUpError) {
      console.error(
        `Error counting FollowUps for ${executiveName}:`,
        followUpError
      );
      followUpsCount = 0; // Fallback to 0
    }

    // Respond with data
    res.status(200).json({
      success: true,
      data: {
        followUps: followUpsCount,
      },
    });
  } catch (error) {
    console.error("FollowUp stats error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getConvertedClientStats = async (req, res) => {
  try {
    const executiveName = req.user.username;

    if (!executiveName) {
      return res.status(400).json({
        success: false,
        message: "Executive name missing from token.",
      });
    }

    let convertedClientCount = 0;
    try {
      convertedClientCount =
        (await ConvertedClient.count({
          include: [
            {
              model: FreshLead,
              as: "freshLead", // Make sure alias matches association
              include: [
                {
                  model: Lead,
                  as: "lead", // Make sure alias matches association
                  where: { assignedToExecutive: executiveName },
                },
              ],
            },
          ],
        })) || 0;

      console.log(
        `ConvertedClientCount for ${executiveName}:`,
        convertedClientCount
      );
    } catch (countError) {
      console.error(
        `Error counting ConvertedClients for ${executiveName}:`,
        countError
      );
      convertedClientCount = 0;
    }

    res.status(200).json({
      success: true,
      data: {
        convertedClients: convertedClientCount,
      },
    });
  } catch (error) {
    console.error("Converted Client stats error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports = {
  getExecutiveDashboardStats,
  getExecutiveFollowUpStats,
  getConvertedClientStats,
};
