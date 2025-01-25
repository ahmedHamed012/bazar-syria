const catchAsync = require("../../utils/catchAsync");
const generateUniqueMemberId = require("../../utils/generate-member-id");
const hashString = require("../../utils/hash-string");
const {
  findUserByIdHelperFn,
  findUserByMemberIdHelperFn,
} = require("../../utils/helper-functions");
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
      return res.status(201).json({ message: "User created successfully" });
    } else {
      return res.status(400).json({ message: "User already exists" });
    }
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
  const user = await findUserByMemberIdHelperFn(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
});
//---------------------------------------------------------------------------------------
const updateUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const newUserData = req.body;
  const avatar = req.file;

  const user = await User.findOne({ memberId: id, isDeleted: false });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updatedUser = await User.findOneAndUpdate(
    { memberId: id },
    {
      ...newUserData,
      avatar: avatar ? avatar.filename : user.avatar,
      modifiedAt: new Date().getTime(),
    },
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
//---------------------------------------------------------------------------------------
const followUser = catchAsync(async (req, res, next) => {
  const { id } = req.params; // ID of the user to be followed
  const myId = req.user.id; // Current user's ID

  // Find the user to be followed
  const user = await User.findOne({ memberId: id, isDeleted: false });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // Find the current user's data
  const myData = await User.findOne({ _id: myId, isDeleted: false });
  if (!myData) {
    return res.status(404).json({ message: "Your account was not found" });
  }

  // Check if already following
  if (myData.following && myData.following.includes(user._id)) {
    return res
      .status(400)
      .json({ message: "You are already following this user" });
  }

  // Add to following for the current user
  myData.following.push(user._id);

  // Add to followers for the target user
  user.followers.push(myData._id);

  // Save both records
  await myData.save();
  await user.save();

  res.status(200).json({ message: `You are now following ${user.name}` });
});
//---------------------------------------------------------------------------------------
const getMyFollowers = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await findUserByIdHelperFn(id);

  if (!user) {
    return res.status(404).json({ message: "Your account no longer existed" });
  }
  // Fetch the follower details using Promise.all
  const followersDetails = await Promise.all(
    user.followers.map(async (followerId) => {
      return findUserByIdHelperFn(followerId);
    })
  );

  res
    .status(200)
    .json({ followers: followersDetails, length: user.followers.length });
});
//---------------------------------------------------------------------------------------
const getMyFollowings = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await findUserByIdHelperFn(id);

  if (!user) {
    return res.status(404).json({ message: "Your account no longer existed" });
  }
  // Fetch the following details using Promise.all
  const followingDetails = await Promise.all(
    user.following.map(async (followingId) => {
      return findUserByIdHelperFn(followingId);
    })
  );

  res
    .status(200)
    .json({ following: followingDetails, length: user.following.length });
});
//---------------------------------------------------------------------------------------
const rateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params; // ID of the user being rated
  const { rate, message } = req.body; // Rating and optional message
  const currentUserId = req.user.id; // ID of the user giving the rating

  // Validate the rating (ensure it's between 1 and 5)
  if (rate < 1 || rate > 5) {
    return res
      .status(400)
      .json({ message: "Rating must be between 1 and 5 stars" });
  }

  // Find the user to be rated
  const userToRate = await User.findById(id);
  if (!userToRate) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the current user is trying to rate themselves
  if (id === currentUserId) {
    return res.status(400).json({ message: "You cannot rate yourself" });
  }

  // Add the rating to the target user's ratings
  userToRate.ratings.push({
    ratedBy: currentUserId,
    rating: rate,
    message: message || "",
  });

  // Save the updated user data
  await userToRate.save();

  // Respond with success
  res.status(200).json({
    message: "Rating added successfully!",
    ratings: userToRate.ratings,
  });
});
//---------------------------------------------------------------------------------------
const getUserRatingsStatistics = catchAsync(async (req, res, next) => {
  const id = req.body.id ? req.body.id : req.user.id; // ID of the user whose ratings are being fetched

  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If the user has no ratings, return an empty object with 0 percentages
  if (user.ratings.length === 0) {
    return res.status(200).json({
      message: "No ratings available",
      ratingPercentages: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    });
  }

  // Calculate the total number of ratings
  const totalRatings = user.ratings.length;

  // Calculate the count for each rating degree (1, 2, 3, 4, 5)
  const ratingCounts = [1, 2, 3, 4, 5].reduce((acc, rating) => {
    acc[rating] = user.ratings.filter((r) => r.rating === rating).length;
    return acc;
  }, {});

  // Calculate the percentage for each rating degree
  const ratingPercentages = [1, 2, 3, 4, 5].reduce((acc, rating) => {
    acc[rating] = Math.ceil((ratingCounts[rating] / totalRatings) * 100);
    return acc;
  }, {});

  // Respond with the rating percentages
  res.status(200).json({
    message: "Rating statistics fetched successfully",
    ratings: user.ratings,
    ratingPercentages,
  });
});

//---------------------------------------------------------------------------------------
module.exports = {
  createNewUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  followUser,
  getMyFollowers,
  getMyFollowings,
  rateUser,
  getUserRatingsStatistics,
};
