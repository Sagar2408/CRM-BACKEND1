const { getTenantDB } = require("../config/sequelizeManager");

const updateUserLoginStatus = async (req, res) => {
  try {
    const { userId, canLogin } = req.body;

    // 1) Validate request body
    if (typeof userId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 2) Get the tenant database
    const tenantDB = req.db; // Changed from req.tenantDB to req.db
    if (!tenantDB || !tenantDB.Users) {
      return res.status(500).json({
        success: false,
        message: "Tenant database not properly initialized",
      });
    }

    // 3) Update the flag
    await tenantDB.Users.update(
      { can_login: !!canLogin },
      { where: { id: userId } }
    );

    return res.status(200).json({
      success: true,
      message: `User ${userId} can_login set to ${!!canLogin}`,
    });
  } catch (error) {
    console.error("Error updating user login status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserLoginStatus = async (req, res) => {
  try {
    const { userId } = req.query;

    // 1) Validate
    if (typeof userId === "undefined") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 2) Get the tenant database
    const tenantDB = req.db; // Changed from req.tenantDB to req.db
    if (!tenantDB || !tenantDB.Users) {
      return res.status(500).json({
        success: false,
        message: "Tenant database not properly initialized",
      });
    }

    // 3) Fetch only the fields you need
    const user = await tenantDB.Users.findByPk(userId, {
      attributes: ["id", "username", "can_login", "role", "is_online"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error getting user login status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  updateUserLoginStatus,
  getUserLoginStatus,
};