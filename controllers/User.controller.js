const { Users } = require("../config/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/*-----------------------Login---------------------*/
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === "Admin") {
      const users = await Users.findAll({
        attributes: {
          exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
        },
      });
      return res.json(users);
    } else if (role === "TL") {
      // Team Lead can see their team (Executives) and their own profile
      const users = await Users.findAll({
        where: {
          [Op.or]: [{ id: id }, { role: "Executive" }],
        },
        attributes: {
          exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
        },
      });
      return res.json(users);
    }

    // Executives can only see their own profile
    const user = await Users.findByPk(id, {
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signupLocal = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Only allow valid roles
    const validRoles = ["Admin", "TL", "Executive"];
    if (!username || !password || !role || !validRoles.includes(role)) {
      return res.status(400).json({
        error:
          "Username, password, and valid role (Admin, TL, or Executive) are required",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await Users.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    let errorMessage = "Internal server error";
    if (error.name === "SequelizeValidationError") {
      errorMessage = error.errors.map((e) => e.message).join(", ");
    } else if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage = "Username or email already exists";
    }
    return res.status(500).json({ error: errorMessage });
  }
};
const getAdminDashboard = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
      },
    });
    res.json({
      message: "Welcome to Admin Dashboard",
      users,
      currentUser: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTLDashboard = async (req, res) => {
  try {
    const users = await Users.findAll({
      where: {
        [Op.or]: [{ id: req.user.id }, { role: "Executive" }],
      },
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
      },
    });
    res.json({
      message: "Welcome to Team Lead Dashboard",
      teamMembers: users,
      currentUser: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("TL dashboard error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getExecutiveDashboard = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
      },
    });
    res.json({
      message: "Welcome to Executive Dashboard",
      user: user,
    });
  } catch (error) {
    console.error("Executive dashboard error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
/*-------------------Executive Profile---------------------*/
const getExecutiveById = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user; // from auth middleware

    // Check access
    if (
      requestingUser.role === "Executive" &&
      requestingUser.id !== parseInt(userId, 10)
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Find user
    const executive = await Users.findOne({
      where: { id: userId, role: "Executive" },
      attributes: ["id", "username", "email", "role", "createdAt"],
    });

    if (!executive) {
      return res.status(404).json({ message: "Executive not found." });
    }

    res.status(200).json({ executive });
  } catch (error) {
    console.error("Error fetching executive:", error);
    res.status(500).json({ message: "Server error." });
  }
};
/*----------------------------Admin profile------------------*/
const getAdminById = async (req, res) => {
  try {
    const adminId = req.user.id; // ✅ Take from authenticated token

    const admin = await Users.findOne({
      where: { id: adminId, role: "Admin" },
      attributes: ["id", "username", "email", "role"],
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/*-------------------------Forgot Password--------------*/
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetTokenExpiry,
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click this link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/*--------------------------Logout----------------------*/
// Logout user by clearing the cookie
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/*-------------------------Reset Password--------------*/
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    const user = await Users.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    });

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// NEW API: Get all Executives
const getAllExecutives = async (req, res) => {
  try {
    const { role } = req.user;

    // Only Admin and TL can access this endpoint
    if (role !== "Admin" && role !== "TL") {
      return res.status(403).json({
        message: "Unauthorized: Only Admin and TL can view all executives",
      });
    }

    const executives = await Users.findAll({
      where: { role: "Executive" },
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
      },
    });

    res.status(200).json({
      message: "Executives retrieved successfully",
      executives: executives,
    });
  } catch (error) {
    console.error("Error fetching executives:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// NEW API: Get all Team Leads
const getAllTeamLeads = async (req, res) => {
  try {
    const { role } = req.user;

    // Only Admin can access this endpoint
    if (role !== "Admin") {
      return res.status(403).json({
        message: "Unauthorized: Only Admin can view all team leads",
      });
    }

    const teamLeads = await Users.findAll({
      where: { role: "TL" },
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpiry"],
      },
    });

    res.status(200).json({
      message: "Team Leads retrieved successfully",
      teamLeads: teamLeads,
    });
  } catch (error) {
    console.error("Error fetching team leads:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Export all controller methods
module.exports = {
  login,
  getUserProfile,
  signupLocal,
  forgotPassword,
  resetPassword,
  getAdminDashboard,
  getTLDashboard,
  getAdminById,
  logout,
  getExecutiveDashboard,
  getAllExecutives,
  getExecutiveById,
  getAllTeamLeads,
};
