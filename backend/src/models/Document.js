const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  documentType: { type: String, required: true },
  filePath: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", DocumentSchema);
