import sys
import json
import cv2
import pytesseract

def extract_pan_details(image_path):
    try:
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        processed_image = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # Extract text using Tesseract OCR
        extracted_text = pytesseract.image_to_string(processed_image)
        
        # Find PAN details in extracted text
        pan_details = {
            "documentNumber": "",
            "name": "",
            "dob": ""
        }
        
        lines = extracted_text.split("\n")
        for line in lines:
            if "Permanent Account Number" in line or "INCOME TAX DEPARTMENT" in line:
                pan_details["documentNumber"] = line.split()[-1]
            elif "DOB" in line or "Date of Birth" in line:
                pan_details["dob"] = line.split()[-1]
            elif pan_details["name"] == "" and len(line) > 3:
                pan_details["name"] = line.strip()

        if pan_details["documentNumber"]:
            print(json.dumps({"document_info": pan_details}))
        else:
            print(json.dumps({"error": "PAN Card details not found"}))
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image provided"}))
    else:
        extract_pan_details(sys.argv[1])
