const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require("./category.controller");

//TODO: Add Administration Restriction
router.post("/", createCategory);
router.get("/all", getAllCategories);
router.get("/:id", getCategoryById);
router.patch("/:id", updateCategoryById);
router.delete("/:id", deleteCategoryById);

module.exports = router;
