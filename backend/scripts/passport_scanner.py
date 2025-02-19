import sys
import json
import cv2
import pytesseract

def extract_passport_details(image_path):
    try:
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        processed_image = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

        # Extract text using Tesseract OCR
        extracted_text = pytesseract.image_to_string(processed_image)

        passport_details = {
            "documentNumber": "",
            "name": "",
            "dob": ""
        }

        lines = extracted_text.split("\n")
        for line in lines:
            if "PASSPORT" in line or "REPUBLIC OF INDIA" in line:
                passport_details["documentNumber"] = line.split()[-1]
            elif "DOB" in line or "Date of Birth" in line:
                passport_details["dob"] = line.split()[-1]
            elif passport_details["name"] == "" and len(line) > 3:
                passport_details["name"] = line.strip()

        if passport_details["documentNumber"]:
            print(json.dumps({"document_info": passport_details}))
        else:
            print(json.dumps({"error": "Passport details not found"}))
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image provided"}))
    else:
        extract_passport_details(sys.argv[1])
