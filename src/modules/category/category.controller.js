const catchAsync = require("../../utils/catchAsync");
const Category = require("./category.schema");
const SubCategory = require("../subcategory/sub-category.schema");
const Product = require("../product/product.schema");

//-----------------------------------------------------------------------------------------

const createCategory = catchAsync(async (req, res, next) => {
  const categoryData = req.body;
  const duplicateCategory = await Category.findOne({
    name: categoryData.name,
  });

  if (duplicateCategory) {
    if (duplicateCategory.isDeleted) {
      await Category.findOneAndUpdate(
        { name: categoryData.name },
        { isDeleted: false }
      );
      return res.status(201).json({ message: "Category created successfully" });
    } else {
      return res.status(400).json({ message: "Category already exists" });
    }
  }

  const newCategory = await new Category({
    ...categoryData,
  });
  await newCategory.save();

  res
    .status(201)
    .json({ message: "Category created successfully", category: newCategory });
});
//-----------------------------------------------------------------------------------------
const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isDeleted: false }).select(
    "-isDeleted"
  );
  if (!categories || categories.length === 0) {
    return res
      .status(200)
      .json({ message: "No categories found", categories: [] });
  }
  res.status(200).json({ categories });
});
//-----------------------------------------------------------------------------------------
const getCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.find({ _id: id, isDeleted: false }).select(
    "-isDeleted"
  );
  if (!category || category.length === 0) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json({ category: category[0] });
});
//-----------------------------------------------------------------------------------------
const updateCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const newCategoryData = req.body;

  const category = await Category.findOne({ _id: id, isDeleted: false });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const updatedCategory = await Category.findOneAndUpdate(
    { _id: id },
    { ...newCategoryData, modifiedAt: new Date().getTime() },
    {
      new: true,
    }
  );

  res.status(200).json({
    message: "Category updated successfully",
    category: updatedCategory,
  });
});
//-----------------------------------------------------------------------------------------
const deleteCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category || category.length === 0) {
    return res.status(404).json({ message: "Category not found" });
  }

  await Category.findOneAndUpdate({ _id: id }, { isDeleted: true });
  await SubCategory.updateMany(
    { categoryId: id, isDeleted: false },
    { isDeleted: true }
  );
  await Product.updateMany(
    { categoryId: id, isDeleted: false },
    { isDeleted: true }
  );

  res.status(200).json({ message: "Category deleted successfully" });
});
//-----------------------------------------------------------------------------------------
module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
