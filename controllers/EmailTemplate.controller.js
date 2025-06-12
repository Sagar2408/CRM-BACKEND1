const nodemailer = require("nodemailer");
require("dotenv").config();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (req, res) => {
  const {
    executiveEmail,
    executiveName,
    clientEmail,
    emailBody,
    emailSubject,
  } = req.body;

  if (!executiveEmail || !clientEmail) {
    return res.status(400).json({
      success: false,
      message: "Missing Email Address",
    });
  }
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail(executiveEmail) || !isValidEmail(clientEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  const mailOptions = {
    from: executiveEmail,
    to: clientEmail,
    subject: emailSubject || "Greetings from " + executiveName,
    text:
      emailBody ||
      "Hello! We just wanted to say hi and hope you're doing well!",
    replyTo: executiveEmail,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Email Sent Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const EmailTemplate = req.db.EmailTemplate;
    const { name, subject, body } = req.body;
    const createdBy = req.user.id; // Assuming token middleware adds req.user

    if (!name || !subject || !body) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const template = await EmailTemplate.create({
      name,
      subject,
      body,
      createdBy,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error("Create template error:", error);
    res.status(500).json({ message: "Server error creating template." });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const EmailTemplate = req.db.EmailTemplate;
    const templates = await EmailTemplate.findAll({
      where: { createdBy: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(templates);
  } catch (error) {
    console.error("Fetch templates error:", error);
    res.status(500).json({ message: "Server error fetching templates." });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const EmailTemplate = req.db.EmailTemplate;
    const { id } = req.params;

    const template = await EmailTemplate.findOne({
      where: {
        id,
        createdBy: req.user.id,
      },
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error("Fetch single template error:", error);
    res.status(500).json({ message: "Server error fetching template." });
  }
};
