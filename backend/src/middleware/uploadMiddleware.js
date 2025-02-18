const multer = require("multer");
const path = require("path");

// ✅ STORAGE CONFIGURATION
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// ✅ FILE FILTER (ONLY PDF, PNG, JPG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// ✅ MULTER INSTANCE
const upload = multer({ storage, fileFilter });

module.exports = upload;
