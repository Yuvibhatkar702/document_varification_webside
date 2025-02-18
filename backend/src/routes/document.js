const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const axios = require("axios");

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer for Aadhaar uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// ✅ Aadhaar Verification API (Uses Improved OCR Processing)
router.post("/verify-aadhaar", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aadhaar document is required" });
    }

    const filePath = path.join(uploadDir, req.file.filename);
    console.log("✅ Aadhaar file uploaded:", filePath);

    // ✅ Call Python OCR API
    const response = await axios.post("http://localhost:5001/api/extract-text", {
      image_path: filePath,
    });

    const extractedText = response.data.text;
    console.log("✅ Extracted Aadhaar Text:", extractedText);

    // ✅ Aadhaar Keywords for Verification (Better Matching)
    const aadhaarKeywords = [
      "Aadhaar", "Unique Identification Authority", "Government of India",
      "DOB", "MALE", "FEMALE", "UIDAI"
    ];
    
    const isValid = aadhaarKeywords.some((word) => extractedText.includes(word));

    if (isValid) {
      console.log("✅ Aadhaar Verified");
      return res.json({ message: "Aadhaar Verified ✅", extractedText });
    } else {
      console.log("❌ Aadhaar Verification Failed");
      return res.status(400).json({ message: "Aadhaar Verification Failed ❌", extractedText });
    }
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


module.exports = router;
