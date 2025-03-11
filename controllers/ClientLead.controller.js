const fs = require("fs");
const path = require("path");
const multer = require("multer");
const xlsx = require("xlsx");
const csv = require("csv-parser"); // Make sure to install with npm install csv-parser

const { ClientLead } = require("../config/sequelize");

// Define allowed attributes to save to the database
const allowedAttributes = ["name", "email", "phone", "address"]; // Update this list as needed

const upload = multer({ dest: "uploads/" });

const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileData = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Filter row to include only allowed attributes
        const filteredRow = {};
        for (const key of allowedAttributes) {
          if (row.hasOwnProperty(key)) {
            filteredRow[key] = row[key];
          }
        }
        fileData.push(filteredRow);
      })
      .on("end", () => resolve(fileData))
      .on("error", (err) => reject(err));
  });
};

const processExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  // Filter each record to include only allowed attributes
  return data.map((record) => {
    const filteredRecord = {};
    for (const key of allowedAttributes) {
      if (record.hasOwnProperty(key)) {
        filteredRecord[key] = record[key];
      }
    }
    return filteredRecord;
  });
};

const uploadFile = async (req, res) => {
  try {
    console.log("📌 ClientLead Model:", ClientLead); // Debugging: Check if the model is loaded properly

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    let data = [];

    if (fileExt === ".xlsx" || fileExt === ".xls") {
      // Process Excel file
      data = processExcel(file.path);
    } else if (fileExt === ".csv") {
      // Process CSV file
      try {
        data = await processCSV(file.path);
      } catch (err) {
        console.error("Error processing CSV file:", err);
        return res.status(500).json({ message: "Failed to process CSV file" });
      }
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    // Save filtered data to the database
    try {
      for (const record of data) {
        await ClientLead.create(record);
      }
      res.status(200).json({ message: "File uploaded and data saved" });
    } catch (err) {
      console.error("Failed to save data:", err);
      return res.status(500).json({ message: "Failed to save data" });
    } finally {
      // Cleanup the uploaded file
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Error uploading file" });
  }
};

module.exports = {
  upload,
  uploadFile,
};
