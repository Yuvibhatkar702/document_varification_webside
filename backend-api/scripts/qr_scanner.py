import sys
import json
import cv2
from pyzbar.pyzbar import decode

def scan_qr(image_path):
    try:
        img = cv2.imread(image_path)
        detected_qr = decode(img)

        if not detected_qr:
            print(json.dumps({"error": "No QR code found"}))
            return

        for qr_code in detected_qr:
            qr_text = qr_code.data.decode("utf-8")

            # Example Aadhaar data extraction
            aadhaar_data = {
                "document_info": {
                    "documentNumber": "XXXX-XXXX-XXXX",  # Masked for privacy
                    "name": "Extracted Name",
                    "dob": "01-01-1990",
                    "additionalInfo": "QR Data Processed"
                }
            }
            print(json.dumps(aadhaar_data))
            return

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
    else:
        scan_qr(sys.argv[1])
