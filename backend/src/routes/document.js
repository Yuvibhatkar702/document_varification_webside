const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");

const router = express.Router();

// ✅ Ensure uploads folder is inside "backend/" (not "src/")
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Fix Multer Storage Configuration
const storage = multer.diskStorage({
  destination: uploadDir, // ✅ Save directly in "backend/uploads/"
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// ✅ Upload & Verify Document
router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(uploadDir, req.file.filename);
    console.log("✅ File uploaded:", filePath);

    // ✅ Check if the file exists after upload
    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found after upload:", filePath);
      return res.status(500).json({ error: "File not found after upload" });
    }

    // ✅ Convert image to grayscale (better OCR accuracy)
    const processedPath = filePath.replace(/\.[^.]+$/, "-processed.png");
    console.log("🔄 Processing image for OCR:", processedPath);

    try {
      await sharp(filePath).grayscale().toFile(processedPath);
      console.log("✅ Image processed:", processedPath);
    } catch (sharpError) {
      console.error("🔥 Sharp Image Processing Error:", sharpError);
      return res.status(500).json({ error: "Image processing failed", details: sharpError.message });
    }

    // ✅ Perform OCR (Extract Text from Image)
    try {
      const { data } = await Tesseract.recognize(processedPath, "eng");
      console.log("✅ Extracted Text:", data.text);

      // ✅ Check for required document keywords
      const keywords = ["Government", "ID", "Passport", "Aadhaar", "License"];
      const isValid = keywords.some((word) => data.text.includes(word));

      fs.unlinkSync(processedPath); // Cleanup processed image

      if (isValid) {
        console.log("✅ Document Verified");
        return res.json({ message: "Document Verified ✅", extractedText: data.text });
      } else {
        console.log("❌ Document Verification Failed");
        return res.status(400).json({ message: "Document Verification Failed ❌", extractedText: data.text });
      }
    } catch (tesseractError) {
      console.error("🔥 Tesseract OCR Error:", tesseractError);
      return res.status(500).json({ error: "OCR processing failed", details: tesseractError.message });
    }
  } catch (error) {
    console.error("🔥 General Server Error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
