const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupProcessPerson = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const ProcessPerson = req.db.ProcessPerson; // Dynamically selected table for ProcessPerson

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: "Full Name, Email, and Password are required fields.",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingPerson = await ProcessPerson.findOne({
      where: { email },
    });

    if (existingPerson) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const person = await ProcessPerson.create({
      fullName,
      email,
      password: hashedPassword,
      isActive: true, // Setting isActive to true by default
    });

    return res.status(201).json({
      message: "ProcessPerson created successfully",
      person: {
        id: person.id,
        fullName: person.fullName,
        email: person.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    let errorMessage = "Internal server error";
    if (error.name === "SequelizeValidationError") {
      errorMessage = error.errors.map((e) => e.message).join(", ");
    } else if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage = "Email already exists";
    }
    return res.status(500).json({ error: errorMessage });
  }
};

const loginProcessPerson = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ProcessPerson = req.db.ProcessPerson; // Dynamically selected table for ProcessPerson

    const person = await ProcessPerson.findOne({
      where: { email, isActive: true },
    });

    if (!person) {
      return res
        .status(404)
        .json({ message: "ProcessPerson not found or is inactive" });
    }

    const isMatch = await bcrypt.compare(password, person.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: person.id,
        email: person.email,
        fullName: person.fullName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      person: {
        id: person.id,
        email: person.email,
        fullName: person.fullName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const logoutProcessPerson = async (req, res) => {
  try {
    const ProcessPerson = req.db.ProcessPerson; // ✅ Use dynamic DB injection
    const personId = req.user?.id;

    if (!personId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: token missing or invalid" });
    }

    const person = await ProcessPerson.findByPk(personId);

    if (!person) {
      return res.status(404).json({ message: "ProcessPerson not found" });
    }

    // Optional: Mark as offline (if you have is_online or similar)
    // person.is_online = false;
    // await person.save();

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAllConvertedClients = async (req, res) => {
  try {
    const ClientLead = req.db.ClientLead; // Dynamically selected model

    const convertedClients = await ClientLead.findAll({
      where: { status: "Converted" },
      order: [["updatedAt", "DESC"]], // Optional: order by recent conversions
    });

    res.status(200).json({
      message: "Converted clients retrieved successfully",
      count: convertedClients.length,
      clients: convertedClients,
    });
  } catch (error) {
    console.error("Error fetching converted clients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const importConvertedClientsToCustomers = async (req, res) => {
  try {
    const ClientLead = req.db.ClientLead;
    const Customer = req.db.Customer;

    const convertedLeads = await ClientLead.findAll({
      where: { status: "Converted" },
    });

    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const lead of convertedLeads) {
      if (!lead.email || !lead.phone) {
        skippedCount++;
        continue;
      }

      const existingCustomer = await Customer.findOne({
        where: { email: lead.email },
      });

      if (existingCustomer) {
        skippedCount++;
        continue;
      }

      try {
        const hashedPassword = await bcrypt.hash(lead.phone, 10);

        await Customer.create({
          fullName: lead.name,
          email: lead.email,
          password: hashedPassword,
          status: "pending",
        });

        importedCount++;
      } catch (err) {
        errors.push({ email: lead.email, error: err.message });
      }
    }

    res.status(200).json({
      message: "Import completed",
      imported: importedCount,
      skipped: skippedCount,
      errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loginProcessPerson,
  signupProcessPerson,
  logoutProcessPerson,
  getAllConvertedClients,
  importConvertedClientsToCustomers,
};
