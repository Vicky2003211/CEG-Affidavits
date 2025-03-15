const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uroll_no: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["student", "staff","HOD", "Admin"] },
  semester: { type: String, required: function () { return this.role === "student"; } },
  course: { type: String, required: function () { return this.role === "student"; } },
});

// 🔒 Hash password before saving for both students & staff
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔍 Compare password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
