const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  name: { type: String }, // Only used for group chats
  isGroup: { type: Boolean, default: false }, // True for group chats, false for one-to-one chats
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Participants
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who created the group (if applicable)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);
