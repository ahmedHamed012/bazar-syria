const catchAsync = require("../../utils/catchAsync");
const User = require("../user/user.schema");
const Category = require("../category/category.schema");
const SubCategory = require("../subcategory/sub-category.schema");
const Advertisement = require("./adv.schema");
const { findUserByIdHelperFn } = require("../../utils/helper-functions");

const createAdvertisement = catchAsync(async (req, res, next) => {
  const advData = req.body;
  const creator = req.user.id;
  const gallery = req.processedImages;

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
const getMyAds = catchAsync(async (req, res, next) => {
  const currentUser = req.user.id;
  const user = await findUserByIdHelperFn(currentUser);
  const advertisements = await Advertisement.find({
    creator: user._id,
    isDeleted: false,
  }).select("-isDeleted");
  if (!advertisements || advertisements.length === 0) {
    return res
      .status(200)
      .json({ message: "No Ads. found", advertisements: [] });
  }
  advertisements.forEach((adv) => {
    adv.gallery = adv.gallery.map(
      (image) => `${process.env.ATTACHMENTS_URL}${image.slice(9, image.length)}`
    );
  });
  res.status(200).json({ advertisements });
});
//--------------------------------------------------------------------------------------
const getAllAds = catchAsync(async (req, res, next) => {
  const advertisements = await Advertisement.find({
    isDeleted: false,
  }).select("-isDeleted");
  if (!advertisements || advertisements.length === 0) {
    return res
      .status(200)
      .json({ message: "No Ads. found", advertisements: [] });
  }
  advertisements.forEach((adv) => {
    adv.gallery = adv.gallery.map(
      (image) => `${process.env.ATTACHMENTS_URL}${image.slice(9, image.length)}`
    );
  });
  res.status(200).json({ advertisements });
});
//--------------------------------------------------------------------------------------
const getAddsByCategoriesAndSubcategories = catchAsync(
  async (req, res, next) => {
    const queryData = req.query;
    if (!queryData.category) {
      return res.status(400).json({
        message: "You must provide at least category id",
      });
    }
    if (queryData.category && !queryData.subCategory) {
      const advertisements = await Advertisement.find({
        category: queryData.category,
        isDeleted: false,
      }).select("-isDeleted");
      if (!advertisements || advertisements.length === 0) {
        return res
          .status(200)
          .json({ message: "No Ads. found", advertisements: [] });
      }
      return res.status(200).json({ advertisements });
    }
    const adsWithCategoriesAndSubcategories = await Advertisement.find({
      category: queryData.category,
      subCategory: queryData.subCategory,
      isDeleted: false,
    }).select("-isDeleted");
    if (
      !adsWithCategoriesAndSubcategories ||
      adsWithCategoriesAndSubcategories.length === 0
    ) {
      return res
        .status(200)
        .json({ message: "No Ads. found", advertisements: [] });
    }
    res.status(200).json({ advertisements: adsWithCategoriesAndSubcategories });
  }
);
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
  advertisement.forEach((adv) => {
    adv.gallery = adv.gallery.map(
      (image) => `${process.env.ATTACHMENTS_URL}${image.slice(9, image.length)}`
    );
  });
  res.status(200).json({ advertisement: advertisement[0] });
});
//---------------------------------------------------------------------------------------
const updateAdvertisementById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const newAdvData = req.body;
  const currentUser = req.user.id;
  const user = await findUserByIdHelperFn(currentUser);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const gallery = req.processedFiles ? req.processedFiles : [];

  const advertisement = await Advertisement.findOne({ _id: id });
  if (!advertisement) {
    return res.status(404).json({ message: "Advertisement not found" });
  }

  //Check if this ad is valid for current user
  if (advertisement.creator.toString() !== user._id.toString()) {
    return res
      .status(404)
      .json({ message: "You are not allowed to update this advertisement" });
  }

  // Check Existence of Category
  if (newAdvData.category) {
    const category = await Category.findOne({ _id: newAdvData.category });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  // Check Existence of SubCategory
  if (newAdvData.subCategory) {
    const subCategory = await SubCategory.findOne({
      _id: newAdvData.subCategory,
    });
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }
  }

  gallery = gallery.map(
    (image) => `${process.env.ATTACHMENTS_URL}${image.slice(9, image.length)}`
  );

  const updatedAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: id },
    {
      ...newAdvData,
      gallery: gallery.length > 0 ? gallery : advertisement.gallery,
      modifiedAt: new Date().getTime(),
    },
    { new: true }
  );
  res.status(200).json({
    message: "Advertisement updated successfully",
    updatedAdvertisement,
  });
});
//---------------------------------------------------------------------------------------
const deleteAdvertisementById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUser = req.user.id;
  const user = await findUserByIdHelperFn(currentUser);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const advertisement = await Advertisement.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!advertisement || advertisement.length === 0) {
    return res.status(404).json({ message: "Advertisement not found" });
  }

  if (advertisement.creator.toString() !== user._id.toString()) {
    return res
      .status(404)
      .json({ message: "You are not allowed to delete this advertisement" });
  }

  await Advertisement.findOneAndUpdate({ _id: id }, { isDeleted: true });

  res.status(200).json({ message: "Advertisement deleted successfully" });
});
//---------------------------------------------------------------------------------------

module.exports = {
  getAdvertisementById,
  createAdvertisement,
  getMyAds,
  getAllAds,
  getAddsByCategoriesAndSubcategories,
  updateAdvertisementById,
  deleteAdvertisementById,
};
