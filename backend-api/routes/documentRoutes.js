const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Document = require('../models/document');
const { verifyAadhaarOCR, verifyAadhaarQRCode } = require('../utils/aadhaarUtils');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Multi-Document Verification Route
router.post('/verify-document', upload.single('documentImage'), async (req, res) => {
    const { documentType } = req.body;
    if (!req.file || !documentType) {
        return res.status(400).json({ error: 'Missing file or document type' });
    }

    const imagePath = path.join(__dirname, '..', req.file.path);
    console.log(`✅ Uploaded Document: ${imagePath}, Type: ${documentType}`);

    let verificationResult = { success: false };

    if (documentType === "Aadhaar") {
        // ✅ Try both QR Code & OCR Verification
        const qrResult = await verifyAadhaarQRCode(imagePath);
        const ocrResult = await verifyAadhaarOCR(imagePath);

        if (qrResult.success) {
            verificationResult = qrResult;
        } else if (ocrResult.success) {
            verificationResult = ocrResult;
        } 

        if (!verificationResult.success) {
            return res.status(400).json({ error: "❌ Aadhaar Verification Failed. Please upload a valid Aadhaar card." });
        }
    } else {
        return res.status(400).json({ error: "Unsupported document type" });
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
        res.json({ message: `${documentType} Verified & Stored Successfully ✅`, data: verificationResult.data });
    } catch (error) {
        console.error(`❌ Database Error: ${error}`);
        res.status(500).json({ error: 'Error storing document details', details: error.message });
    }
});

module.exports = router;
