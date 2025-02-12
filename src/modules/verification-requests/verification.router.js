const express = require("express");
const {
  verifyIdentification,
  getAllVerifyRequests,
  getVerifyRequestById,
  approveRequest,
  rejectRequest,
} = require("./verification.controller");
const router = express.Router();

// Multer for file uploads
const multer = require("multer");
const addWaterMark = require("../../utils/addWaterMark");
const { protect, adminRestriction } = require("../auth/auth.controller");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/verification-attachments/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + " " + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/all", getAllVerifyRequests);
router.get("/:id", getVerifyRequestById);
router.use(protect);
router.post(
  "/verify-request",
  upload.fields([
    { name: "identificationFront" },
    { name: "identificationBack" },
    { name: "faceFrontSide" },
    { name: "faceLeftSide" },
    { name: "businessProfile" },
  ]),
  verifyIdentification
);
router.use(adminRestriction);
router.post("/:id/approve", approveRequest);
router.post("/:id/reject", rejectRequest);

module.exports = router;
