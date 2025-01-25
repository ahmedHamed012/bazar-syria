const mongoose = require("mongoose");
const subCategorySchema = mongoose.Schema({
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String },
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
module.exports = mongoose.model("SubCategory", subCategorySchema);
