const mongoose = require("mongoose");

// Rating sub-schema
const ratingSchema = mongoose.Schema({
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user who gives the rating
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Min rating is 1 star
    max: 5, // Max rating is 5 stars
  },
  message: {
    type: String,
    required: false, // Optional message with the rating
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
//---------------------------------------------------------------------------------------
// User Schema
const userSchema = mongoose.Schema({
  googleId: { type: String, unique: false, default: null },
  memberId: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
  },
  birthdate: {
    type: Date,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  gender: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
    required: false,
  },
  about: {
    type: String,
    required: false,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  ratings: [ratingSchema], // Array of ratings
  isDeleted: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  resetTokenExpirationDate: { type: Date, default: null },
  createdAt: {
    type: Number,
    default: new Date().getTime(),
  },
  modifiedAt: {
    type: Number,
    default: new Date().getTime(),
  },
});
module.exports = mongoose.model("User", userSchema);
