const catchAsync = require("../../utils/catchAsync");
const Product = require("./product.schema");
//-----------------------------------------------------------------------------------------

const createProduct = catchAsync(async (req, res, next) => {
  const productData = req.body;

  const duplicateProduct = await Product.findOne({
    name: productData.name,
  });

  if (duplicateProduct) {
    if (duplicateProduct.isDeleted) {
      await Product.findOneAndUpdate(
        { name: productData.name },
        { isDeleted: false }
      );
      return res.status(201).json({ message: "Product created successfully" });
    } else {
      return res.status(400).json({ message: "Product already exists" });
    }
  }

  const newProduct = await new Product({
    ...productData,
  });
  await newProduct.save();

  res.status(201).json({
    message: "Product created successfully",
    product: newProduct,
  });
});
//-----------------------------------------------------------------------------------------
const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isDeleted: false }).select(
    "-isDeleted"
  );
  if (!products || products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }
  res.status(200).json({ products });
});
//-----------------------------------------------------------------------------------------
const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.find({
    _id: id,
    isDeleted: false,
  }).select("-isDeleted");
  if (!product || product.length === 0) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ product: product[0] });
});
//-----------------------------------------------------------------------------------------
const updateProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const newProductData = req.body;

  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: id },
    {
      ...newProductData,
      modifiedAt: new Date().getTime(),
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});
//-----------------------------------------------------------------------------------------
const deleteProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product || product.length === 0) {
    return res.status(404).json({ message: "Product not found" });
  }
  await Product.findOneAndUpdate({ _id: id }, { isDeleted: true });
  res.status(200).json({ message: "Product deleted successfully" });
});
//-----------------------------------------------------------------------------------------
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
