const jwt = require("jsonwebtoken");
const catchAsync = require("../../utils/catchAsync");
const User = require("../user/user.schema");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { promisify } = require("util");
const nodemailer = require("nodemailer");
const {
  findUserByMemberIdHelperFn,
  findUserByIdHelperFn,
} = require("../../utils/helper-functions");
const {
  VerificationRequest,
  PersonalVerification,
  OrganizationVerification,
} = require("../verification-requests/verification.schema");
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
//-----------------------------------------------------------------------------------------
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
//-----------------------------------------------------------------------------------------
const verifyUserPassword = async (dbPassword, userPassword, next) => {
  try {
    return await bcrypt.compare(userPassword, dbPassword);
    // return userPassword == dbPassword;
  } catch (error) {
    throw next(error);
  }
};
//-----------------------------------------------------------------------------------------
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check that the email and password is valid data
  if (!email || !password) {
    res
      .status(400)
      .json({ message: "الرجاء إدخال البريد الإلكتروني وكلمة المرور صحيحة" });
  }

  //2) Check user exist with the same entered email and password
  const userExist = await User.findOne({ email: email });
  if ((userExist !== null || userExist !== undefined) && !userExist) {
    res.status(404).json({ message: "هذا المستخدم غير موجود" });
  }

  if (!userExist.emailVerified) {
    return res
      .status(400)
      .json({ message: "برجاء التأكد من تفعيل الحساب الخاص بك" });
  }

  const passwordCorrect = await verifyUserPassword(
    userExist.password,
    password,
    next
  );

  if (!passwordCorrect)
    res.status(400).json({ message: "كلمة المرور غير صحيحة" });

  const tokenPayload = {
    id: userExist.memberId,
    email: userExist.email,
    name: userExist.name,
    avatar: userExist.avatar,
    followers: userExist.followers,
    following: userExist.following,
  };
  const token = generateToken(tokenPayload);
  res.status(200).json({ token });
});
//-----------------------------------------------------------------------------------------

const protect = catchAsync(async (req, res, next) => {
  //1) Check the existence of token in the headers
  let token;
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    res.status(401).json({ message: "Please! Login First" });
  }
  token = req.headers.authorization.split(" ")[1];

  //2) check the validation of token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
  //3) Check the user existence
  const existedUser = await User.findOne({
    memberId: decoded.id,
    isDeleted: false,
  });
  if (!existedUser) {
    res.status(404).json({ message: "User no longer existed" });
  }
  req.user = existedUser;
  next();
});
//-----------------------------------------------------------------------------------------
const adminRestriction = catchAsync(async (req, res, next) => {
  if (!req.user.role || req.user.role !== "admin") {
    return res
      .status(401)
      .json({ message: "You are not authorized for this action" });
  }
  next();
});
//-----------------------------------------------------------------------------------------
const forgotPassword = catchAsync(async (req, res, next) => {
  //1)- Get The User From the provided email
  const email = req.body.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "برجاء التأكد من صحة البريد الالكتروني" });
  }
  const userExisted = await User.findOne({ email: email, isDeleted: false });
  if (!userExisted || userExisted.length == 0) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }
  //2)- Generate the random token and encrypt it then store it into db
  const resetToken = String(Math.floor(1000 + Math.random() * 9000)); //crypto.randomBytes(32).toString("hex")
  const encryptedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expirationDate = new Date(new Date().getTime() + 10 * 60 * 1000);

  const saveToken = await User.findOneAndUpdate(
    {
      _id: userExisted._id,
    },
    {
      passwordResetToken: encryptedToken,
      resetTokenExpirationDate: expirationDate,
    },
    { new: true }
  );
  if (!saveToken) {
    return res.status(500).json({ message: "خطأ فى حفظ التوكن" });
  }
  //3)- Send the token via email
  // const requestURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #333333;
      font-size: 24px;
    }
    .otp-box {
      text-align: center;
      background-color: #f2f2f2;
      padding: 20px;
      border-radius: 8px;
      font-size: 28px;
      font-weight: bold;
      color: #0C9547;
      margin: 20px 0;
    }
    .content {
      font-size: 16px;
      color: #555555;
      line-height: 1.6;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      font-size: 14px;
      color: #999999;
    }
    .footer a {
      color: #0C9547;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <img src="https://iili.io/2DDfKcF.png" width="auto" height="80" alt="Syria Bazar Logo">
      <p>Hello, ${userExisted.name}</p>
      <p>You requested to reset your password. Please use the following OTP to complete the process:</p>
      <div class="otp-box">${resetToken}</div>
      <p>This OTP is valid for the next <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact our <a href="mailto:info@pzsyria.com">support team</a>.</p>
      <p>Thank you!</p>
    </div>
  </div>
</body>
</html>
  `;
  await sendEmail({
    email: userExisted.email,
    subject: "Syria Bazar - User Reset Password",
    message: message,
  });
  // console.log("Your OTP is: ", resetToken);
  res.status(200).json({
    message: "تم إرسال بريد إلكتروني يحتوى على الرمز الخاص بتغيير كلمة المرور",
  });
});
//-----------------------------------------------------------------------------------------

const resetPassword = catchAsync(async (req, res, next) => {
  //1) Get token from the parameters and encrypt it using same mechanism as the forget
  const { token } = req.params;
  const { password, confirmPassword, email } = req.body;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  if (!email) {
    return res
      .status(400)
      .json({ message: "برجاء التأكد من صحة البريد الالكتروني " });
  }
  //2) Search for user with the same token and valid expiration date
  const getUserWithSameToken = await User.findOne({
    passwordResetToken: encryptedToken,
    email,
    isDeleted: false,
  });
  if (!getUserWithSameToken || getUserWithSameToken.length == 0) {
    return res.status(404).json({
      message: "الرمز الذى ادخلته قد يكون غير صحيح او المستخدم غير موجود",
    });
  }
  const expirationDateCompare =
    new Date(getUserWithSameToken.resetTokenExpirationDate).getTime() >
    new Date().getTime();

  if (!expirationDateCompare) {
    return res.status(400).json({ message: "الرمز منتهي الصلاحية" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "كلمة المرور غير متوافقة" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  // const hashedPassword = password;
  const updateUserPassword = await User.findOneAndUpdate(
    {
      password: hashedPassword,
    },
    { _id: getUserWithSameToken._id },
    { new: true }
  );
  const tokenPayload = {
    id: getUserWithSameToken._id,
    email: getUserWithSameToken.email,
    name: getUserWithSameToken.name,
  };
  const jwtToken = generateToken(tokenPayload);
  await User.findOneAndUpdate(
    {
      _id: getUserWithSameToken._id,
    },
    {
      passwordResetToken: null,
      resetTokenExpirationDate: null,
    }
  );
  res.status(200).json({ token: jwtToken });
});
//-----------------------------------------------------------------------------------------
const getMyProfile = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await findUserByIdHelperFn(id);
  const verificationRequests = await VerificationRequest.find({
    userId: id,
  })
    .populate("userId")
    .select("status");
  const updatedUser = {
    ...user.toObject(),
    idVerificationStatus: verificationRequests[0]?.status,
  };

  res.status(200).json({ user: updatedUser });
});
//-----------------------------------------------------------------------------------------
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465, //  TLS    25       587     2525           SSL 465
      secure: true, // true for 465, false for other ports
      auth: {
        // user: account.user, // generated ethereal user
        // pass: account.pass // generated ethereal password
        user: "info@pzsyria.com",
        pass: "QuillAgencyAM2024+",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: "info@pzsyria.com",
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};
module.exports = {
  googleCallback,
  login,
  protect,
  forgotPassword,
  resetPassword,
  adminRestriction,
  getMyProfile,
  sendEmail,
};
