const express = require("express");
const {
  createAdvertisement,
  getAdvertisementById,
  getAllAds,
  updateAdvertisementById,
  deleteAdvertisementById,
} = require("./adv.controller");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../auth/auth.controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/adv-gallery/`);
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + " " + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.use(protect);
router.get("/all", getAllAds);
router.post("/", upload.array("gallery"), createAdvertisement);
router.get("/:id", getAdvertisementById);
router.patch("/:id", upload.array("gallery"), updateAdvertisementById);
router.delete("/:id", deleteAdvertisementById);

module.exports = router;
