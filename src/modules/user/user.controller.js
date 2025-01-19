const catchAsync = require("../../utils/catchAsync");
const generateUniqueMemberId = require("../../utils/generate-member-id");
const hashString = require("../../utils/hash-string");
const User = require("./user.schema");
//---------------------------------------------------------------------------------------
const createNewUser = catchAsync(async (req, res, next) => {
  const user = req.body;
  const avatar = req.file;
  const duplicatedUser = await User.findOne({ email: user.email });

  if (duplicatedUser) {
    if (duplicatedUser.isDeleted) {
      await User.findOneAndUpdate(
        { memberId: duplicatedUser.memberId },
        { isDeleted: false }
      );
    }
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = await new User({
    ...user,
    memberId: await generateUniqueMemberId(User),
    password: await hashString(user.password),
    avatar: avatar ? avatar.filename : null,
  });
  await newUser.save();

  res.status(201).json({ message: "User created successfully", user: newUser });
});
//---------------------------------------------------------------------------------------
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isDeleted: false }).select(
    "-googleId -password -isDeleted"
  );
  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }
  res.status(200).json({ users });
});
//---------------------------------------------------------------------------------------
const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.find({ memberId: id, isDeleted: false }).select(
    "-googleId -password -isDeleted"
  );
  if (!user || user.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user: user[0] });
});
//---------------------------------------------------------------------------------------
const updateUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const newUserData = req.body;
  const avatar = req.file;

  const user = await User.findOne({ memberId: id, isDeleted: false });

  if (!user || user.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const updatedUser = await User.findOneAndUpdate(
    { memberId: id },
    { ...newUserData, avatar: avatar ? avatar.filename : user.avatar },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json({ message: "User updated successfully", user: updatedUser });
});
//---------------------------------------------------------------------------------------
const deleteUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ memberId: id, isDeleted: false });
  if (!user || user.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  await User.findOneAndUpdate({ memberId: id }, { isDeleted: true });
  res.status(200).json({ message: "User deleted successfully" });
});
module.exports = {
  createNewUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
