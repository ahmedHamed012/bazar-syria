const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  memberId: {
    type: Number,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
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
    default: new Date().getDate(),
  },
  modifiedAt: {
    type: Number,
    default: new Date().getDate(),
  },
});
module.exports = mongoose.model("User", userSchema);
