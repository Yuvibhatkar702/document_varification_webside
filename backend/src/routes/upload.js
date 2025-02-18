const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Storage engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload route
router.post("/", upload.single("document"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ message: "File uploaded successfully", file: req.file.filename });
});

module.exports = router;
