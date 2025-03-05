const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  categoryId: { type: Number, unique: true },
  categoryName: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String }, // Example: "fa-solid fa-certificate"
});


// Auto-increment categoryId before saving
CategorySchema.pre("save", async function (next) {
  if (!this.categoryId) {
    const lastCategory = await mongoose.model("Category").findOne().sort({ categoryId: -1 });
    this.categoryId = lastCategory ? lastCategory.categoryId + 1 : 1; // Start from 1 if no categories exist
  }
  next();
});

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
