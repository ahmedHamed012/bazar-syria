const jwt = require("jsonwebtoken");
const catchAsync = require("../../utils/catchAsync");
const googleCallback = catchAsync(async (req, res, next) => {
  const payload = {
    id: req.user.id,
    email: req.user.email,
  };

  // Sign a JWT token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });

  // Send token as response
  res.json({ token, message: "Login successful!" });
});

module.exports = { googleCallback };
