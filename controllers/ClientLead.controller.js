const fs = require("fs"); // File system module for handling file operations
const path = require("path"); // Path module for working with file paths
const multer = require("multer"); // Multer for handling file uploads
const xlsx = require("xlsx"); // XLSX module for processing Excel files
const csv = require("csv-parser"); // CSV parser for handling CSV files

const { ClientLead } = require("../config/sequelize"); // Importing the ClientLead model

// Define possible dynamic field names for "name" and "phone" mapping
const nameFields = [
  "name",
  "username",
  "full name",
  "contact name",
  "lead name",
];
const phoneFields = ["phone", "ph.no", "contact number", "mobile", "telephone"];

// Multer setup for file uploads (stores uploaded files in the "uploads/" directory)
const upload = multer({ dest: "uploads/" });

// Function to map field names dynamically to standard names ("name" and "phone")
const mapFieldName = (fieldName) => {
  if (nameFields.includes(fieldName.toLowerCase())) return "name";
  if (phoneFields.includes(fieldName.toLowerCase())) return "phone";
  return fieldName;
};

// Function to process CSV files and map fields dynamically
const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileData = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const mappedRow = {};
        for (const key in row) {
          const mappedField = mapFieldName(key);
          mappedRow[mappedField] = row[key];
        }
        fileData.push(mappedRow);
      })
      .on("end", () => resolve(fileData))
      .on("error", (err) => reject(err));
  });
};

// Function to process Excel files and map fields dynamically
const processExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Get the first sheet
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  return data.map((record) => {
    const mappedRecord = {};
    for (const key in record) {
      const mappedField = mapFieldName(key);
      mappedRecord[mappedField] = record[key];
    }
    return mappedRecord;
  });
};

// Function to handle file upload, process it, and store data in the database
const uploadFile = async (req, res) => {
  try {
    console.log("📌 ClientLead Model:", ClientLead); // Debugging: Check if the model is loaded properly

    const file = req.file; // Retrieve uploaded file

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileExt = path.extname(file.originalname).toLowerCase(); // Get file extension
    let data = [];

    if (fileExt === ".xlsx" || fileExt === ".xls") {
      data = processExcel(file.path); // Process Excel files
    } else if (fileExt === ".csv") {
      try {
        data = await processCSV(file.path); // Process CSV files
      } catch (err) {
        console.error("Error processing CSV file:", err);
        return res.status(500).json({ message: "Failed to process CSV file" });
      }
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    try {
      // Save processed data into the database
      for (const record of data) {
        await ClientLead.create(record);
      }
      res.status(200).json({ message: "File uploaded and data saved" });
    } catch (err) {
      console.error("Failed to save data:", err);
      return res.status(500).json({ message: "Failed to save data" });
    } finally {
      // Delete the uploaded file after processing
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Error uploading file" });
  }
};

// Function to retrieve all client leads from the database
const getClientLeads = async (req, res) => {
  try {
    const leads = await ClientLead.findAll();
    res.status(200).json({ leads });
  } catch (err) {
    console.error("Error fetching client leads:", err);
    res.status(500).json({ message: "Failed to fetch client leads" });
  }
};

// Function to assign an executive to a client lead
const assignExecutive = async (req, res) => {
  try {
    const { id } = req.params; // Extract lead ID from request parameters
    const { executiveName } = req.body; // Extract executive name from request body

    if (!executiveName) {
      return res.status(400).json({ message: "Executive name is required" });
    }

    // Find the client lead by ID
    const lead = await ClientLead.findByPk(id);
    if (!lead) {
      return res.status(404).json({ message: "Client lead not found" });
    }

    // Update the assignedToExecutive field
    lead.assignedToExecutive = executiveName;
    await lead.save();

    res.status(200).json({ message: "Executive assigned successfully", lead });
  } catch (err) {
    console.error("Error assigning executive:", err);
    res.status(500).json({ message: "Failed to assign executive" });
  }
};

// Function to get client leads assigned to a specific executive
const getLeadsByExecutive = async (req, res) => {
  try {
    const { executiveName } = req.query; // Extract executive name from query parameters

    if (!executiveName) {
      return res.status(400).json({ message: "Executive name is required" });
    }

    // Fetch leads assigned to the specified executive
    const leads = await ClientLead.findAll({
      where: { assignedToExecutive: executiveName },
    });

    if (leads.length === 0) {
      return res.status(404).json({
        message: `No leads found for executive: ${executiveName}`,
      });
    }

    res.status(200).json({ message: "Leads retrieved successfully", leads });
  } catch (err) {
    console.error("Error fetching leads by executive:", err);
    res.status(500).json({ message: "Failed to fetch leads by executive" });
  }
};

// Export functions for use in other parts of the application
module.exports = {
  upload,
  uploadFile,
  getClientLeads,
  assignExecutive,
  getLeadsByExecutive,
};
