import sys
import json
import cv2
import numpy as np
from pyzbar.pyzbar import decode

def scan_qr_code(image_path):
    image = cv2.imread(image_path)
    qr_codes = decode(image)

    if not qr_codes:
        print(json.dumps({"error": "No QR Code Found"}))
        return

    for qr_code in qr_codes:
        qr_data = qr_code.data.decode('utf-8')
        print(json.dumps({"aadhaar_info": qr_data}))
        return

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image provided"}))
    else:
        scan_qr_code(sys.argv[1])
