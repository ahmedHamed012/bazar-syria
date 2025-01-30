const mongoose = require("mongoose");
const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  hasTradeMarks: { type: Boolean, required: true },
  tradeMarks: [{ type: String }], // Only if hasTradeMarks is true
  specialProperties: [
    {
      property: { type: String, required: true },
      type: { type: String, required: true },
      values: [{ type: String }], // for the dropdown type
    },
  ],
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
