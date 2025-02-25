const express = require("express");
const multer = require("multer");
const path = require("path");
const { processAadhaar } = require("../utils/aadhaarProcessor");

const router = express.Router();

// Configure Multer storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, or PDF files are allowed"), false);
        }
        cb(null, true);
    }
});

// Aadhaar Upload Endpoint
router.post("/upload-aadhaar", upload.single("aadhaar"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const result = await processAadhaar(req.file);
        res.json({ status: "Verified", details: result });

    } catch (error) {
        res.status(500).json({ message: error.message || "Verification failed" });
    }
});

module.exports = router;
