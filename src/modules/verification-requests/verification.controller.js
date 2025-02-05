const catchAsync = require("../../utils/catchAsync");
const { findUserByIdHelperFn } = require("../../utils/helper-functions");
const User = require("../user/user.schema");
const {
  VerificationRequest,
  PersonalVerification,
  OrganizationVerification,
} = require("./verification.schema");

const verifyIdentification = catchAsync(async (req, res, next) => {
  const { userType, firstName, lastName, address, birthDate, identity } =
    req.body;
  const userId = req.user.id;
  const user = await findUserByIdHelperFn(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const duplicateVerification = await VerificationRequest.findOne({
    userId: user._id,
  });

  if (duplicateVerification) {
    return res
      .status(400)
      .json({ error: "You have already submitted a verification request" });
  }

  let verificationData;
  if (userType === "personal") {
    verificationData = new PersonalVerification({
      userId: user._id,
      userType,
      firstName,
      lastName,
      address,
      birthDate,
      identity,
      identificationFront: req.files.identificationFront?.[0]?.path,
      identificationBack: req.files.identificationBack?.[0]?.path,
      faceFrontSide: req.files.faceFrontSide?.[0]?.path,
      faceLeftSide: req.files.faceLeftSide?.[0]?.path,
    });
  } else if (userType === "organization") {
    verificationData = new OrganizationVerification({
      userId,
      userType,
      businessProfile: req.files.businessProfile?.[0]?.path,
    });
  } else {
    return res.status(400).json({ error: "Invalid userType" });
  }

  await verificationData.save();
  res
    .status(201)
    .json({ message: "Verification request submitted successfully" });
});
//----------------------------------------------------------------------------------------
const getAllVerifyRequests = catchAsync(async (req, res, next) => {
  const verificationRequests = await VerificationRequest.find({})
    .populate("userId")
    .select("-isDeleted");
  if (!verificationRequests || verificationRequests.length === 0) {
    return res
      .status(200)
      .json({
        message: "No verification Requests found",
        verificationRequests: [],
      });
  }
  res.status(200).json({ verificationRequests });
});
//----------------------------------------------------------------------------------------
const getVerifyRequestById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const verificationRequest = await VerificationRequest.find({
    _id: id,
  })
    .populate("userId")
    .select("-isDeleted");
  if (!verificationRequest || verificationRequest.length === 0) {
    return res.status(404).json({ message: "Verification Request not found" });
  }
  res.status(200).json({ verificationRequest: verificationRequest[0] });
});
//----------------------------------------------------------------------------------------
const approveRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const verificationRequest = await VerificationRequest.find({
    _id: id,
  })
    .populate("userId")
    .select("-isDeleted");
  if (
    !verificationRequest ||
    verificationRequest.length === 0 ||
    verificationRequest[0].status !== "pending"
  ) {
    return res.status(404).json({
      message: "Verification Request not found or not in pending status",
    });
  }
  await User.findOneAndUpdate(
    { _id: verificationRequest[0].userId },
    { verified: true }
  );
  await VerificationRequest.findOneAndUpdate(
    { _id: id },
    { reviewedAt: Date.now(), status: "approved" }
  );
  res
    .status(200)
    .json({ message: "Verification request approved successfully" });
});
//----------------------------------------------------------------------------------------
const rejectRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { adminComment } = req.body;
  const verificationRequest = await VerificationRequest.find({
    _id: id,
  })
    .populate("userId")
    .select("-isDeleted");
  if (
    !verificationRequest ||
    verificationRequest.length === 0 ||
    verificationRequest[0].status !== "pending"
  ) {
    return res.status(404).json({
      message: "Verification Request not found or not in pending status",
    });
  }

  await User.findOneAndUpdate(
    { _id: verificationRequest[0].userId },
    { verified: false }
  );

  await VerificationRequest.findOneAndUpdate(
    { _id: id },
    {
      reviewedAt: Date.now(),
      adminComment: adminComment ? adminComment : null,
      status: "rejected",
    }
  );
  res
    .status(200)
    .json({ message: "Verification request rejected successfully" });
});
module.exports = {
  verifyIdentification,
  getAllVerifyRequests,
  getVerifyRequestById,
  approveRequest,
  rejectRequest,
};
