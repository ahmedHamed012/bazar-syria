const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
  categoryId: { type: String, required: true },
  subCategoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Number,
    default: new Date().getTime(),
  },
  modifiedAt: {
    type: Number,
    default: new Date().getTime(),
  },
});
module.exports = mongoose.model("Product", productSchema);
