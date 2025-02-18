const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// AI-Based Verification
router.post("/upload", upload.single("document"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const imagePath = path.join(__dirname, "../uploads", req.file.filename);

  try {
    // **OCR Processing using Tesseract**
    const { data } = await Tesseract.recognize(imagePath, "eng");

    // **Simulate Verification by Checking Required Keywords**
    const keywords = ["Government", "ID", "Passport", "Aadhaar", "License"];
    const isValid = keywords.some((word) => data.text.includes(word));

    if (isValid) {
      res.json({ message: "Document Verified ✅", extractedText: data.text });
    } else {
      res.status(400).json({ message: "Document Verification Failed ❌" });
    }

    // Cleanup the uploaded file
    fs.unlinkSync(imagePath);
  } catch (error) {
    res.status(500).json({ message: "Error in verification", error: error });
  }
});

module.exports = router;
