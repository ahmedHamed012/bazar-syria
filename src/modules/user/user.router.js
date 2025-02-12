const express = require("express");
const {
  createNewUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  followUser,
  getMyFollowers,
  getMyFollowings,
  rateUser,
  getUserRatingsStatistics,
  verifyAccountAndRegister,
} = require("./user.controller");
const userValidationSchema = require("./user.validation");
const validate = require("../../utils/validationMiddleware");
const router = express.Router();
const multer = require("multer");
const { protect, adminRestriction } = require("../auth/auth.controller");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/user-profiles/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("avatar"), createNewUser);
router.get("/verify-account/:token", verifyAccountAndRegister);
//TODO: Add Administration Restriction
router.use(protect); // Protect This Routes That It can't be run without token
// Protected Routes
router.get("/", getAllUsers);
router.post("/:id/follow", followUser);
router.get("/profile/followers", getMyFollowers);
router.get("/profile/followings", getMyFollowings);
router.post("/:id/rate", rateUser);
router.get("/profile/ratings", getUserRatingsStatistics);
router.patch("/:id", upload.single("avatar"), updateUserById);
router.get("/:id", getUserById);
router.use(adminRestriction);
router.delete("/:id", deleteUserById);

module.exports = router;
