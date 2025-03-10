const xlsx = require("xlsx");
const { ClientLead } = require("../models/ClientLead.model");

// Upload and save Excel data
exports.uploadClientLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Save each row to the database
    for (const row of sheetData) {
      await ClientLead.create({
        name: row.name,
        email: row.email,
        phone: row.phone,
        education: row.education,
        experience: row.experience,
        state: row.state,
        country: row.country,
        dob: row.dob,
        leadAssignDate: row.leadAssignDate,
        countryPreference: row.countryPreference,
        assignedToExecutive: row.assignedToExecutive,
        status: row.status || "New",
      });
    }

    res.status(200).send("File uploaded and data saved successfully.");
  } catch (err) {
    console.error("❌ Error processing file:", err);
    res.status(500).send("Error saving data.");
  }
};
