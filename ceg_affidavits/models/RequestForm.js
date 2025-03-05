const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uroll_no: { type: String, required: true },
  father_name: { type: String, required: true },
  mother_name: { type: String, required: true },
  course: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  email: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true }, 
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "pdfs" }, // GridFS reference
  certificateName: { type: String }, // Stores the PDF filename
  form_id: { type: String, required: true },
  sentTo: { type: String, default: "staff" },
  status: { type: String, default: "pending" },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RequestForm", formSchema);
