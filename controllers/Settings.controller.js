const { Users } = require("../config/sequelize"); // Adjust path as needed

// Update user settings
exports.updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes user is authenticated and ID is available
    const {
      firstname,
      lastname,
      country,
      city,
      state,
      postal_code,
      tax_id,
      profile_picture,
    } = req.body;

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the fields
    user.firstname = firstname ?? user.firstname;
    user.lastname = lastname ?? user.lastname;
    user.country = country ?? user.country;
    user.city = city ?? user.city;
    user.state = state ?? user.state;
    user.postal_code = postal_code ?? user.postal_code;
    user.tax_id = tax_id ?? user.tax_id;
    user.profile_picture = profile_picture ?? user.profile_picture;

    await user.save();

    return res.status(200).json({
      message: "User settings updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated

    const user = await Users.findByPk(userId, {
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
