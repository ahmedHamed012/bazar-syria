const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} = require("./product.controller");

//TODO: Add Administration Restriction
router.post("/", createProduct);
router.get("/all", getAllProducts);
router.get("/:id", getProductById);
router.patch("/:id", updateProductById);
router.delete("/:id", deleteProductById);

module.exports = router;
