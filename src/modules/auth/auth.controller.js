const jwt = require("jsonwebtoken");
const catchAsync = require("../../utils/catchAsync");
const User = require("../user/user.schema");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

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
    res.status(400).json({ message: "Please provide email and password" });
  }

  //2) Check user exist with the same entered email and password
  const userExist = await User.findOne({ email: email });
  if (!userExist) {
    res.status(404).json({ message: "User not found" });
  }

  const passwordCorrect = await verifyUserPassword(
    userExist.password,
    password,
    next
  );

  if (!passwordCorrect) res.status(400).json({ message: "Incorrect password" });

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

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   //1)- Get The User From the provided email
//   const email = req.body.email;
//   if (!email) {
//     return next(new AppError(i18n.__("provideValidMail"), 400));
//   }
//   const userExisted = await select("user", ["id", "firstName", "email"], {
//     email,
//   });
//   if (!userExisted || userExisted.length == 0) {
//     return next(new AppError(i18n.__("userMailNotFound"), 404));
//   }
//   //2)- Generate the random token and encrypt it then store it into db
//   const resetToken = String(Math.floor(1000 + Math.random() * 9000)); //crypto.randomBytes(32).toString("hex")
//   const encryptedToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   const expirationDate = new Date(new Date().getTime() + 10 * 60 * 1000);
//   const saveToken = await update(
//     "user",
//     {
//       passwordResetToken: encryptedToken,
//       resetTokenExpirationDate: expirationDate,
//     },
//     {
//       id: userExisted[0].id,
//     }
//   );
//   if (!saveToken) {
//     return next(new AppError(i18n.__("tokenSavedFailed"), 400));
//   }
//   //3)- Send the token via email
//   // const requestURL = `${req.protocol}://${req.get(
//   //   "host"
//   // )}/api/v1/auth/resetPassword/${resetToken}`;
//   const message = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Password Reset OTP</title>
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       background-color: #f4f4f4;
//       margin: 0;
//       padding: 0;
//     }
//     .email-container {
//       max-width: 600px;
//       margin: 0 auto;
//       background-color: #ffffff;
//       padding: 20px;
//       border-radius: 8px;
//       box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//     }
//     .header {
//       text-align: center;
//       padding-bottom: 20px;
//     }
//     .header h1 {
//       color: #333333;
//       font-size: 24px;
//     }
//     .otp-box {
//       text-align: center;
//       background-color: #f2f2f2;
//       padding: 20px;
//       border-radius: 8px;
//       font-size: 28px;
//       font-weight: bold;
//       color: #113a72;
//       margin: 20px 0;
//     }
//     .content {
//       font-size: 16px;
//       color: #555555;
//       line-height: 1.6;
//       text-align: center;
//     }
//     .footer {
//       text-align: center;
//       padding-top: 20px;
//       font-size: 14px;
//       color: #999999;
//     }
//     .footer a {
//       color: #113a72;
//       text-decoration: none;
//     }
//   </style>
// </head>
// <body>
//   <div class="email-container">
//     <div class="header">
//       <h1>Password Reset Request</h1>
//     </div>
//     <div class="content">
//       <img src="https://aitbeg.com/assets/images/aitb-logo.jpeg" width="auto" height="50" alt="AITB Logo">
//       <p>Hello, ${userExisted[0].firstName}</p>
//       <p>You requested to reset your password. Please use the following OTP to complete the process:</p>
//       <div class="otp-box">${resetToken}</div>
//       <p>This OTP is valid for the next <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
//     </div>
//     <div class="footer">
//       <p>If you have any questions, please contact our <a href="mailto:Info@aitbeg.com">support team</a>.</p>
//       <p>Thank you!</p>
//     </div>
//   </div>
// </body>
// </html>
//   `;
//   await sendEmail({
//     email: userExisted[0].email,
//     subject: "CSM - User Reset Password",
//     message: message,
//   });
//   Response(res, i18n.__("tokenSentToMail"), 200, { token: resetToken });
// });
//-----------------------------------------------------------------------------------------

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   //1) Get token from the parameters and encrypt it using same mechanism as the forget
//   const { token } = req.params;
//   const { password, confirmPassword, email } = req.body;
//   const encryptedToken = crypto
//     .createHash("sha256")
//     .update(token)
//     .digest("hex");
//   if (!email) {
//     return next(new AppError(i18n.__("provideValidMail"), 400));
//   }
//   //2) Search for user with the same token and valid expiration date
//   const getUserWithSameToken = await select("user", "*", {
//     passwordResetToken: encryptedToken,
//     email,
//   });
//   if (!getUserWithSameToken || getUserWithSameToken.length == 0) {
//     return next(new AppError(i18n.__("userHasNotSentOtp"), 404));
//   }
//   const expirationDateCompare =
//     new Date(getUserWithSameToken[0].resetTokenExpirationDate).getTime() >
//     new Date().getTime();

//   if (!expirationDateCompare) {
//     return next(new AppError(i18n.__("invalidOtp"), 400));
//   }
//   if (password !== confirmPassword) {
//     return next(new AppError(i18n.__("passwordNotMatch"), 400));
//   }
//   const hashedPassword = await bcrypt.hash(password, 10);
//   // const hashedPassword = password;
//   const updateUserPassword = await update(
//     "user",
//     {
//       password: hashedPassword,
//     },
//     { id: getUserWithSameToken[0].id }
//   );
//   const tokenPayload = {
//     id: getUserWithSameToken[0].id,
//     email: getUserWithSameToken[0].email,
//     userType: getUserWithSameToken[0].userType,
//     firstName: getUserWithSameToken[0].firstName,
//     LastName: getUserWithSameToken[0].LastName,
//     supportUser: getUserWithSameToken[0].supportUser,
//     image: getUserWithSameToken[0].image,
//     // companyId:
//   };
//   const jwtToken = generateToken(tokenPayload);
//   const emptyTheResetToken = await update(
//     "user",
//     {
//       passwordResetToken: null,
//       resetTokenExpirationDate: null,
//     },
//     {
//       id: getUserWithSameToken[0].id,
//     }
//   );
//   Response(res, i18n.__("resetPasswordSuccess"), 200, {
//     token: jwtToken,
//   });
// });
//-----------------------------------------------------------------------------------------

module.exports = { googleCallback, login, protect };
