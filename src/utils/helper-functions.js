const User = require("../modules/user/user.schema");
const catchAsync = require("./catchAsync");
const findUserByMemberIdHelperFn = async (id) => {
  return await User.findOne({ memberId: id, isDeleted: false }).select(
    "-googleId -password -isDeleted"
  );
};
//---------------------------------------------------------------------------------------
const findUserByIdHelperFn = async (id) => {
  return await User.findOne({ _id: id, isDeleted: false }).select(
    "-googleId -password -isDeleted"
  );
};

module.exports = { findUserByMemberIdHelperFn, findUserByIdHelperFn };
