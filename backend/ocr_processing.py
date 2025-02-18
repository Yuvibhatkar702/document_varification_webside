import cv2
import pytesseract
import re
import numpy as np

# ✅ Ensure Tesseract path (Windows users)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def preprocess_image(image_path):
    # Read image
    image = cv2.imread(image_path)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Increase contrast
    alpha = 1.5  # Contrast control
    beta = 10    # Brightness control
    gray = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)

    # Apply adaptive thresholding
    gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

    # Remove noise
    gray = cv2.fastNlMeansDenoising(gray, None, 30, 7, 21)

    # Save processed image
    processed_path = image_path.replace(".jpg", "-processed.jpg")
    cv2.imwrite(processed_path, gray)

    return processed_path

def extract_text(image_path):
    processed_image = preprocess_image(image_path)

    # ✅ Use OCR with correct mode
    custom_config = r"--oem 3 --psm 6"
    text = pytesseract.image_to_string(processed_image, config=custom_config)

    # ✅ Fix common OCR mistakes using regex
    text = re.sub(r"[^\w\s]", "", text)  # Remove special characters
    text = re.sub(r"\s+", " ", text)     # Remove extra spaces
    text = text.replace("GoveMMmMenvor", "Government")  # Fix misread text

    return text.strip()

if __name__ == "__main__":
    image_path = "sample_aadhaar.jpg"
    extracted_text = extract_text(image_path)
    print("Extracted Text:\n", extracted_text)
