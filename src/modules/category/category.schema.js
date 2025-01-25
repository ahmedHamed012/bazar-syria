const mongoose = require("mongoose");
const categorySchema = mongoose.Schema({
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
module.exports = mongoose.model("Category", categorySchema);
