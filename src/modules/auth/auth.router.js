const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {
  googleCallback,
  login,
  forgotPassword,
  resetPassword,
  getMyProfile,
  protect,
} = require("./auth.controller");

// Redirect to Google OAuth consent page
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);
router.post("/login", login);
router.post("/password/forget", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.use(protect);
router.get("/profile", getMyProfile);
module.exports = router;
