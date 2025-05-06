const getExecutiveDashboardStats = async (req, res) => {
  try {
    const { FreshLead, Lead } = req.db; // ✅ Dynamic DB
    const executiveName = req.user.username;

    if (!executiveName) {
      return res.status(400).json({
        success: false,
        message: "Executive name missing from token.",
      });
    }

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
    } catch (error) {
      console.error(`Error counting FreshLeads for ${executiveName}:`, error);
      freshLeadsCount = 0;
    }

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
    const { FollowUp, FreshLead, Lead } = req.db; // ✅ Dynamic DB
    const executiveName = req.user.username;

    if (!executiveName) {
      return res.status(400).json({
        success: false,
        message: "Executive name missing from token.",
      });
    }

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
    } catch (error) {
      console.error(`Error counting FollowUps for ${executiveName}:`, error);
      followUpsCount = 0;
    }

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
    const { ConvertedClient, FreshLead, Lead } = req.db; // ✅ Dynamic DB
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

      console.log(
        `ConvertedClientCount for ${executiveName}:`,
        convertedClientCount
      );
    } catch (error) {
      console.error(
        `Error counting ConvertedClients for ${executiveName}:`,
        error
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
