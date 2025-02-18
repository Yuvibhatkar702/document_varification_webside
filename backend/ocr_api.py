from flask import Flask, request, jsonify
from ocr_processing import extract_text

app = Flask(__name__)

@app.route('/api/extract-text', methods=['POST'])
def extract_text_api():
    try:
        data = request.json
        image_path = data.get("image_path")

        if not image_path:
            return jsonify({"error": "Image path is required"}), 400

        text = extract_text(image_path)

        if not text.strip():
            return jsonify({"error": "No text extracted. Try improving image quality."}), 400

        return jsonify({"text": text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
