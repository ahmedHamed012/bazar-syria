const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require("./category.controller");

router.post("/", createCategory);
/**
 * @swagger
 * /category/all:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all categories.
 *     responses:
 *       200:
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get("/all", getAllCategories);
router.get("/:id", getCategoryById);
router.patch("/:id", updateCategoryById);
router.delete("/:id", deleteCategoryById);
module.exports = router;
