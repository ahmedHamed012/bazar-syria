const mongoose = require("mongoose");

// Base Schema
const baseVerificationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    userType: {
      type: String,
      enum: ["personal", "organization"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    adminComment: { type: String, default: null }, // Reason for rejection
  },
  { discriminatorKey: "userType" } // Enables schema inheritance
);

const VerificationRequest = mongoose.model(
  "VerificationRequest",
  baseVerificationRequestSchema
);

// Personal Verification Schema
const PersonalVerification = VerificationRequest.discriminator(
  "personal",
  new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    birthDate: { type: String, required: true },
    identity: { type: String, required: true }, // Identity number
    identificationFront: { type: String, required: true }, // File path
    identificationBack: { type: String, required: true }, // File path
    faceFrontSide: { type: String, required: true }, // File path
    faceLeftSide: { type: String, required: true }, // File path
  })
);

// Organization Verification Schema
const OrganizationVerification = VerificationRequest.discriminator(
  "organization",
  new mongoose.Schema({
    businessProfile: { type: String, required: true }, // File path
  })
);

module.exports = {
  VerificationRequest,
  PersonalVerification,
  OrganizationVerification,
};
