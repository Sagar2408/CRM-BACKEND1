const fs = require("fs");
const path = require("path");
const multer = require("multer");
const xlsx = require("xlsx");
const csv = require("csv-parser");

const { ClientLead } = require("../config/sequelize");

// Define possible dynamic field names for "name" and "phone"
const nameFields = [
  "name",
  "username",
  "full name",
  "contact name",
  "lead name",
];
const phoneFields = ["phone", "ph.no", "contact number", "mobile", "telephone"];

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

const mapFieldName = (fieldName) => {
  if (nameFields.includes(fieldName.toLowerCase())) return "name";
  if (phoneFields.includes(fieldName.toLowerCase())) return "phone";
  return fieldName;
};

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

const processExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
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
      data = processExcel(file.path);
    } else if (fileExt === ".csv") {
      try {
        data = await processCSV(file.path);
      } catch (err) {
        console.error("Error processing CSV file:", err);
        return res.status(500).json({ message: "Failed to process CSV file" });
      }
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    try {
      for (const record of data) {
        await ClientLead.create(record);
      }
      res.status(200).json({ message: "File uploaded and data saved" });
    } catch (err) {
      console.error("Failed to save data:", err);
      return res.status(500).json({ message: "Failed to save data" });
    } finally {
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
