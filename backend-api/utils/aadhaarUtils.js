const { exec } = require('child_process');
const path = require('path');

async function verifyAadhaarOCR(imagePath) {
    return runPythonScript('scripts/ocr_scanner.py', imagePath);
}

async function verifyAadhaarQRCode(imagePath) {
    return runPythonScript('scripts/qr_scanner.py', imagePath);
}

async function runPythonScript(scriptName, imagePath) {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, '..', scriptName);
        const command = `python ${scriptPath} ${imagePath}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Python Execution Error: ${stderr}`);
                return resolve({ success: false });
            }
            try {
                const result = JSON.parse(stdout);
                if (result.document_info) {
                    resolve({ success: true, data: result.document_info });
                } else {
                    resolve({ success: false });
                }
            } catch (parseError) {
                resolve({ success: false });
            }
        });
    });
}

module.exports = { verifyAadhaarOCR, verifyAadhaarQRCode };
