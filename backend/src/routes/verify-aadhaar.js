const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Aadhaar = require('../models/document'); // Aadhaar Schema

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/verify-aadhaar', upload.single('aadhaarImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = path.join(__dirname, '..', req.file.path);
    
    const pythonProcess = spawn('python3', ['qr_scanner.py', imagePath]);
    
    let resultData = '';
    pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
        fs.unlinkSync(imagePath); // Clean up uploaded file
        try {
            const result = JSON.parse(resultData);

            // Save Aadhaar details in MongoDB
            const newAadhaar = new Aadhaar({
                aadhaarNumber: result.aadhaarNumber,
                name: result.name,
                dob: result.dob,
                address: result.address
            });

            await newAadhaar.save();

            res.json({ message: "Aadhaar Verified & Stored", data: result });

        } catch (error) {
            res.status(500).json({ error: 'Error processing QR code' });
        }
    });
});

module.exports = router;
