import sys
import json
import pytesseract
from PIL import Image

def extract_text(image_path):
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        if not text.strip():
            print(json.dumps({"error": "No text found"}))
            return

        extracted_data = {
            "document_info": {
                "documentNumber": "XXXX-XXXX-XXXX",
                "name": "Extracted Name",
                "dob": "01-01-1990",
                "additionalInfo": "OCR Text Extracted"
            }
        }
        print(json.dumps(extracted_data))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
    else:
        extract_text(sys.argv[1])
