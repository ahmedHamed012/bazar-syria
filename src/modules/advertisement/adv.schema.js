const mongoose = require("mongoose");

const AdvertisementSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  tradeMark: { type: String },
  specialProperties: [{ property: { type: String }, value: { type: String } }],
  advTitle: { type: String, required: true },
  advDescription: { type: String, required: true },
  location: {
    lat: { type: String, required: true },
    long: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    addressDetails: { type: String, required: true },
  },
  price: { type: Number, required: true },
  gallery: [{ type: String }],
  contact: { type: String, enum: ["phone", "chat", "both"], required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Number, default: () => Date.now() },
  modifiedAt: { type: Number, default: () => Date.now() },
});

module.exports = mongoose.model("Advertisement", AdvertisementSchema);
