const mongoose = require("mongoose");

const PDFDocumentSchema = new mongoose.Schema({
  uroll_no: { type: String, required: true },
  categoryId: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }, // Timestamp for tracking
});

const PDFDocument = mongoose.model("PDFDocument", PDFDocumentSchema);
module.exports = PDFDocument;
