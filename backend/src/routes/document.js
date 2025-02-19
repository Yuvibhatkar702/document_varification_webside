// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs-extra");
// const axios = require("axios");


// const router = express.Router();

// // ✅ Ensure uploads folder exists
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ✅ Multer for Aadhaar uploads
// const storage = multer.diskStorage({
//   destination: uploadDir,
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });

// const upload = multer({ storage });

// // ✅ Aadhaar Verification API (Uses Improved OCR Processing)
// router.post("/verify-aadhaar", upload.single("document"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Aadhaar document is required" });
//     }

//     const filePath = path.join(uploadDir, req.file.filename);
//     console.log("✅ Aadhaar file uploaded:", filePath);

//     // ✅ Call Python OCR API
//     const response = await axios.post("http://localhost:5001/api/extract-text", {
//       image_path: filePath,
//     });

//     const extractedText = response.data.text;
//     console.log("✅ Extracted Aadhaar Text:", extractedText);

//     // ✅ Aadhaar Keywords for Verification (Better Matching)
//     const aadhaarKeywords = [
//       "Aadhaar", "Unique Identification Authority", "Government of India",
//       "DOB", "MALE", "FEMALE", "UIDAI"
//     ];
    
//     const isValid = aadhaarKeywords.some((word) => extractedText.includes(word));

//     if (isValid) {
//       console.log("✅ Aadhaar Verified");
//       return res.json({ message: "Aadhaar Verified ✅", extractedText });
//     } else {
//       console.log("❌ Aadhaar Verification Failed");
//       return res.status(400).json({ message: "Aadhaar Verification Failed ❌", extractedText });
//     }
//   } catch (error) {
//     console.error("🔥 Server Error:", error);
//     res.status(500).json({ error: "Internal server error", details: error.message });
//   }
// });



// module.exports = router;













const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Document = require('../models/document');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Multi-Document Verification Route
router.post('/verify-document', upload.single('documentImage'), async (req, res) => {
    const { documentType } = req.body; // Aadhaar, PAN, Passport, etc.

    if (!req.file || !documentType) {
        return res.status(400).json({ error: 'Missing file or document type' });
    }

    const imagePath = path.join(__dirname, '..', req.file.path);
    console.log(`✅ Uploaded Document: ${imagePath}, Type: ${documentType}`);

    let verificationResult;
    if (documentType === "Aadhaar") {
        verificationResult = await verifyAadhaarQRCode(imagePath);
    } else if (documentType === "PAN") {
        verificationResult = await verifyPAN(imagePath);
    } else if (documentType === "Passport") {
        verificationResult = await verifyPassport(imagePath);
    } else {
        return res.status(400).json({ error: "Unsupported document type" });
    }

    if (!verificationResult.success) {
        return res.status(400).json({ error: `${documentType} Verification Failed ❌` });
    }

    // ✅ Store the document details in MongoDB
    try {
        const newDocument = new Document({
            documentType: documentType,
            documentNumber: verificationResult.data.documentNumber,
            name: verificationResult.data.name,
            dob: verificationResult.data.dob,
            additionalInfo: verificationResult.data.additionalInfo
        });

        await newDocument.save();
        console.log(`✅ ${documentType} Data Stored in MongoDB: ${JSON.stringify(newDocument)}`);

        res.json({ message: `${documentType} Verified & Stored Successfully`, data: verificationResult.data });

    } catch (error) {
        console.error(`❌ Database Error: ${error}`);
        res.status(500).json({ error: 'Error storing document details', details: error.message });
    }
});

// ✅ Function to call Aadhaar Verification (Existing Code - No Change)
async function verifyAadhaarQRCode(imagePath) {
    return runPythonScript('scripts/qr_scanner.py', imagePath);
}

// ✅ Function to call PAN Verification (New)
async function verifyPAN(imagePath) {
    return runPythonScript('scripts/pan_scanner.py', imagePath);
}

// ✅ Function to call Passport Verification (New)
async function verifyPassport(imagePath) {
    return runPythonScript('scripts/passport_scanner.py', imagePath);
}

// ✅ Function to Call Python Scripts
async function runPythonScript(scriptPath, imagePath) {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        const pythonProcess = spawn('python3', [scriptPath, imagePath]);

        let resultData = '';
        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`❌ Python Script Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            fs.unlinkSync(imagePath);
            try {
                const result = JSON.parse(resultData);
                if (result.document_info) {
                    resolve({ success: true, data: result.document_info });
                } else {
                    resolve({ success: false });
                }
            } catch (error) {
                resolve({ success: false });
            }
        });
    });
}

module.exports = router;
