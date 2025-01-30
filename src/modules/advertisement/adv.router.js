const express = require("express");
const {
  createAdvertisement,
  getAdvertisementById,
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
router.post("/", upload.array("gallery"), createAdvertisement);
router.get("/:id", getAdvertisementById);

module.exports = router;
