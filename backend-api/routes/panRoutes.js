const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-pan", upload.single("pan"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imagePath = path.join(__dirname, "../", req.file.path);

    // Extract text using OCR
    const { data: { text } } = await Tesseract.recognize(imagePath, "eng");
    
    // Extract PAN Number Pattern (Example: ABCDE1234F)
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    const panMatch = text.match(panRegex);
    const panNumber = panMatch ? panMatch[0] : "Not Found";

    // Cleanup uploaded file
    fs.unlinkSync(imagePath);

    res.json({ success: true, panNumber });
  } catch (error) {
    console.error("Error processing PAN:", error);
    res.status(500).json({ success: false, message: "Error processing PAN" });
  }
});

module.exports = router;
