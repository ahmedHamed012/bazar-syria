const catchAsync = require("../../utils/catchAsync");
const SubCategory = require("./sub-category.schema");
const Product = require("../product/product.schema");
const Category = require("../category/category.schema");
//-----------------------------------------------------------------------------------------

const createSubCategory = catchAsync(async (req, res, next) => {
  const subCategoryData = req.body;
  const icon = req.file;

  const duplicateSubCategory = await SubCategory.findOne({
    name: subCategoryData.name,
  });

  if (duplicateSubCategory) {
    if (duplicateSubCategory.isDeleted) {
      await SubCategory.findOneAndUpdate(
        { name: subCategoryData.name },
        { isDeleted: false }
      );
      return res
        .status(201)
        .json({ message: "SubCategory created successfully" });
    } else {
      return res.status(400).json({ message: "SubCategory already exists" });
    }
  }

  // Check Existence of Category
  const category = await Category.findOne({ _id: subCategoryData.categoryId });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const newSubCategory = await new SubCategory({
    ...subCategoryData,
    icon: icon ? icon.filename : null,
  });
  await newSubCategory.save();

  res.status(201).json({
    message: "SubCategory created successfully",
    subCategory: newSubCategory,
  });
});
//-----------------------------------------------------------------------------------------
const getAllSubCategories = catchAsync(async (req, res, next) => {
  const subCategories = await SubCategory.find({ isDeleted: false }).select(
    "-isDeleted"
  );
  if (!subCategories || subCategories.length === 0) {
    return res
      .status(200)
      .json({ message: "No subCategories found", subCategories: [] });
  }
  subCategories.forEach((subcategory) => {
    if (subcategory.icon) {
      subcategory.icon = `${
        process.env.ATTACHMENTS_URL
      }subCategory-icons/${String(subcategory.icon).slice(
        9,
        String(subcategory.icon).length
      )}`;
    }
  });
  res.status(200).json({ subCategories });
});
//-----------------------------------------------------------------------------------------
const getSubCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.find({
    _id: id,
    isDeleted: false,
  }).select("-isDeleted");
  if (!subCategory || subCategory.length === 0) {
    return res.status(404).json({ message: "SubCategory not found" });
  }
  subCategory.forEach((subcategory) => {
    if (subcategory.icon) {
      subcategory.icon = `${
        process.env.ATTACHMENTS_URL
      }subCategory-icons/${String(subcategory.icon).slice(
        9,
        String(subcategory.icon).length
      )}`;
    }
  });
  res.status(200).json({ subCategory: subCategory[0] });
});
//------------------------------------------------------------------------------------------
const getSubCategoryByCategoryId = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;
  const subCategories = await SubCategory.find({
    categoryId: categoryId,
    isDeleted: false,
  }).select("-isDeleted");
  if (!subCategories || subCategories.length === 0) {
    return res
      .status(200)
      .json({ message: "No subCategories found", subCategories: [] });
  }
  subCategories.forEach((subcategory) => {
    if (subcategory.icon) {
      subcategory.icon = `${
        process.env.ATTACHMENTS_URL
      }subCategory-icons/${String(subcategory.icon).slice(
        9,
        String(subcategory.icon).length
      )}`;
    }
  });
  res.status(200).json({ subCategories });
});
//------------------------------------------------------------------------------------------
const updateSubCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const icon = req.file;
  const newSubCategoryData = req.body;

  const subCategory = await SubCategory.findOne({ _id: id, isDeleted: false });

  if (!subCategory) {
    return res.status(404).json({ message: "SubCategory not found" });
  }

  const updatedSubCategory = await SubCategory.findOneAndUpdate(
    { _id: id },
    {
      ...newSubCategoryData,
      icon: icon ? icon.filename : subCategory.icon,
      modifiedAt: new Date().getTime(),
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    message: "SubCategory updated successfully",
    subCategory: updatedSubCategory,
  });
});
//-----------------------------------------------------------------------------------------
const deleteSubCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findOne({ _id: id, isDeleted: false });
  if (!subCategory || subCategory.length === 0) {
    return res.status(404).json({ message: "SubCategory not found" });
  }
  await SubCategory.findOneAndUpdate({ _id: id }, { isDeleted: true });
  await Product.updateMany(
    { subCategoryId: id, isDeleted: false },
    { isDeleted: true }
  );
  res.status(200).json({ message: "SubCategory deleted successfully" });
});
//-----------------------------------------------------------------------------------------
module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById,
  getSubCategoryByCategoryId,
};
