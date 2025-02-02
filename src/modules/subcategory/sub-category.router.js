const express = require("express");
const router = express.Router();
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById,
} = require("./sub-category.controller");

const multer = require("multer");
const { protect, adminRestriction } = require("../auth/auth.controller");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/subCategory-icons/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

//TODO: Add Administration Restriction
router.use(protect);
router.use(adminRestriction);
router.post("/", upload.single("icon"), createSubCategory);
router.get("/all", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.patch("/:id", upload.single("icon"), updateSubCategoryById);
router.delete("/:id", deleteSubCategoryById);

module.exports = router;
