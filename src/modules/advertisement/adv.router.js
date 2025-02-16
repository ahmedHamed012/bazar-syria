const express = require("express");
const {
  createAdvertisement,
  getAdvertisementById,
  getAllAds,
  updateAdvertisementById,
  deleteAdvertisementById,
  getAddsByCategoriesAndSubcategories,
  getMyAds,
} = require("./adv.controller");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../auth/auth.controller");
const addWaterMark = require("../../utils/addWaterMark");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/adv-gallery/`);
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + " " + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/all", getAllAds);
router.get("/certain/categories", getAddsByCategoriesAndSubcategories);
router.get("/:id", getAdvertisementById);
router.use(protect);
router.get("/my/ads", getMyAds);
router.post("/", upload.array("gallery"), addWaterMark, createAdvertisement);
router.patch(
  "/:id",
  upload.array("gallery"),
  addWaterMark,
  updateAdvertisementById
);
router.delete("/:id", deleteAdvertisementById);

module.exports = router;
