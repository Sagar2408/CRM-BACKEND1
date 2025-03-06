// controllers/User.controller.js
const { Users } = require("../config/sequelize"); // Import the Users model from db
const { Op } = require("sequelize"); // Import Sequelize operators
const bcrypt = require("bcrypt");
const passport = require("passport");
const nodemailer = require("nodemailer"); // Add Nodemailer
const crypto = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email provider (e.g., SMTP)
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

/*-----------------------Login---------------------*/
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: false, // Change this to true in production (HTTPS)
      sameSite: "Lax", // Helps prevent CSRF attacks
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*-------------------------User Profile--------------*/
const getUserProfile = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] }, // Don't return the password
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

// Local Signup (username/email/password)
const signupLocal = async (req, res) => {
  console.log("Signup request received:", req.body);
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Additional validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists
    const existingUser = await Users.findOne({
      where: {
        [Op.or]: [{ username }, { email }], // Use Op.or for Sequelize v6+
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
      oauth_provider: "local",
    });

    console.log("User created:", user.username);
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message || error);
    let errorMessage = "Internal server error";
    if (error.name === "SequelizeValidationError") {
      errorMessage = error.errors.map((e) => e.message).join(", ");
    } else if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage = "Username or email already exists";
    }
    return res.status(500).json({ error: errorMessage });
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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    // Save token and expiry to user
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetTokenExpiry,
    });

    // Send reset email
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`; // Update with your frontend URL
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
// // /*-------------------------Reset Password--------------*/
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
        resetPasswordExpiry: { [Op.gt]: Date.now() }, // Check if token is still valid
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
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
// Export all controller methods
module.exports = {
  login,
  getUserProfile,
  signupLocal,
  forgotPassword,
  // resetPassword,
};
