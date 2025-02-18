const Document = require("../models/Document");

// ✅ UPLOAD DOCUMENT
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const newDocument = new Document({
      user: req.user.id,
      documentType: req.body.documentType,
      filePath: req.file.path,
    });

    await newDocument.save();
    res.status(201).json({ message: "Document uploaded successfully", document: newDocument });
  } catch (err) {
    res.status(500).json({ error: "Error uploading document" });
  }
};

// ✅ VERIFY DOCUMENT STATUS
exports.verifyDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId);
    if (!document) return res.status(404).json({ error: "Document not found" });

    res.json({ status: document.status });
  } catch (err) {
    res.status(500).json({ error: "Error verifying document" });
  }
};
