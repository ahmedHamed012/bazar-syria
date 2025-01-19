const mongoose = require("mongoose");
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
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
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
module.exports = mongoose.model("User", userSchema);
