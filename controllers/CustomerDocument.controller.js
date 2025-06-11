const multer = require("multer");

// Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage }).array("documents"); // field name should be 'documents'

exports.uploadDocuments = (req, res) => {
  const CustomerDocument = req.db.CustomerDocument;
  upload(req, res, async function (err) {
    if (err) {
      console.error("Multer error:", err);
      return res
        .status(400)
        .json({ message: "File upload error.", error: err.message });
    }

    const { customerId } = req.body;

    if (!customerId || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Missing customerId or files." });
    }

    try {
      const documents = await Promise.all(
        req.files.map((file) =>
          CustomerDocument.create({
            customerId,
            documentName: file.originalname,
            mimeType: file.mimetype,
            documentData: file.buffer,
          })
        )
      );

      res.status(201).json({
        message: "Documents uploaded successfully.",
        documents,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      res
        .status(500)
        .json({ message: "Error saving documents to the database." });
    }
  });
};

exports.getDocumentsByCustomerId = async (req, res) => {
  const CustomerDocument = req.db.CustomerDocument;
  try {
    const customerId = req.user.id;

    if (!customerId) {
      return res
        .status(400)
        .json({ message: "Missing customerId in request." });
    }

    const documents = await CustomerDocument.findAll({
      where: { customerId },
      attributes: [
        "id",
        "documentName",
        "mimeType",
        "uploadedAt",
        "documentData",
      ],
    });

    if (!documents || documents.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents found for this customer." });
    }

    // Convert binary data to base64 for safe transfer
    const response = documents.map((doc) => ({
      id: doc.id,
      documentName: doc.documentName,
      mimeType: doc.mimeType,
      uploadedAt: doc.uploadedAt,
      base64Data: doc.documentData.toString("base64"),
    }));

    res.status(200).json({ documents: response });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Error fetching documents." });
  }
};
