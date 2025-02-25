const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");

async function processAadhaar(file) {
    if (file.mimetype === "application/pdf") {
        return await extractTextFromPDF(file.buffer);
    } else {
        return await extractTextFromImage(file.buffer);
    }
}

// OCR for Aadhaar images
async function extractTextFromImage(imageBuffer) {
    const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");
    return extractAadhaarDetails(text);
}

// OCR for Aadhaar PDFs
async function extractTextFromPDF(pdfBuffer) {
    const data = await pdfParse(pdfBuffer);
    return extractAadhaarDetails(data.text);
}

// Aadhaar number extraction logic
function extractAadhaarDetails(text) {
    const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
    const match = text.match(aadhaarRegex);
    return match ? { aadhaarNumber: match[0] } : { error: "Aadhaar number not found" };
}

module.exports = { processAadhaar };
