const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require("./category.controller");
const { adminRestriction, protect } = require("../auth/auth.controller");

//TODO: Add Administration Restriction
router.get("/all", getAllCategories);
router.get("/:id", getCategoryById);
router.use(protect);
router.use(adminRestriction);
router.post("/", createCategory);
router.patch("/:id", updateCategoryById);
router.delete("/:id", deleteCategoryById);

module.exports = router;
