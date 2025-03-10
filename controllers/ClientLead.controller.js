const fs = require("fs");
const path = require("path");
const multer = require("multer");
const xlsx = require("xlsx");
const csv = require("csv-parser");
const ClientLead = require("../models/ClientLead.model");

const upload = multer({ dest: "uploads/" });

const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    let data = [];

    if (fileExt === ".xlsx" || fileExt === ".xls") {
      // Process Excel file
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(sheet);
    } else if (fileExt === ".csv") {
      // Process CSV file
      const fileData = [];
      fs.createReadStream(file.path)
        .pipe(csv())
        .on("data", (row) => fileData.push(row))
        .on("end", async () => {
          data = fileData;

          // Save to database
          try {
            for (const record of data) {
              await ClientLead.create(record);
            }
            res.status(200).json({ message: "File uploaded and data saved" });
          } catch (err) {
            console.error("Failed to save data:", err);
            res.status(500).json({ message: "Failed to save data" });
          }
        });
      return;
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    // Save to database for Excel files
    for (const record of data) {
      await ClientLead.create(record);
    }

    res.status(200).json({ message: "File uploaded and data saved" });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Error uploading file" });
  }
};

module.exports = {
  upload,
  uploadFile,
};
