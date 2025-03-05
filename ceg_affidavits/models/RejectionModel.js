const mongoose = require("mongoose");

const rejectionSchema = new mongoose.Schema({
  uroll_no: {
    type: String,
    required: true,
  },
  categoryId: { type: String, required: true },

  rejectedBy: {
    type: String,
    required: true,
    enum: ["Faculty Advisor", "Head of the Department", "Admin"], // Allowed roles
  },
  rejectionReason: {
    type: String,
    required: true,
  },
  rejectedAt: {
    type: Date,
    default: Date.now, // Auto-set timestamp
  },
});

const Rejection = mongoose.model("Rejection", rejectionSchema);

module.exports = Rejection;
