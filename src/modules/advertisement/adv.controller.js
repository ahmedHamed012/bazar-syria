const catchAsync = require("../../utils/catchAsync");
const User = require("../user/user.schema");
const Category = require("../category/category.schema");
const SubCategory = require("../subcategory/sub-category.schema");
const Advertisement = require("./adv.schema");
const { findUserByIdHelperFn } = require("../../utils/helper-functions");

const createAdvertisement = catchAsync(async (req, res, next) => {
  const advData = req.body;
  const creator = req.user.id;
  const gallery = req.files.map((file) => file.path);

  // Check Existence of Creator
  const user = await findUserByIdHelperFn(creator);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check Existence of Category
  const category = await Category.findOne({ _id: advData.category });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Check Existence of SubCategory
  const subCategory = await SubCategory.findOne({ _id: advData.subCategory });
  if (!subCategory) {
    return res.status(404).json({ message: "SubCategory not found" });
  }

  // Create Advertisement
  const advertisement = new Advertisement({
    ...advData,
    creator,
    gallery: gallery ? gallery : [],
  });
  await advertisement.save();

  return res
    .status(201)
    .json({ message: "Advertisement created successfully" });
});
//--------------------------------------------------------------------------------------
const getAllAds = catchAsync(async (req, res, next) => {
  const currentUser = req.user.id;
  const user = await findUserByIdHelperFn(currentUser);
  const advertisements = await Advertisement.find({
    creator: user._id,
    isDeleted: false,
  }).select("-isDeleted");
  if (!advertisements || advertisements.length === 0) {
    return res.status(404).json({ message: "No Ads. found" });
  }
  res.status(200).json({ advertisements });
});
//--------------------------------------------------------------------------------------
const getAdvertisementById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const advertisement = await Advertisement.find({
    _id: id,
    isDeleted: false,
  }).select("-isDeleted");
  if (!advertisement || advertisement.length === 0) {
    return res.status(404).json({ message: "Advertisement not found" });
  }
  res.status(200).json({ advertisement: advertisement[0] });
});
module.exports = { getAdvertisementById, createAdvertisement, getAllAds };
