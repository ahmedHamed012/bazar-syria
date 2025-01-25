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
} = require("./user.controller");
const userValidationSchema = require("./user.validation");
const validate = require("../../utils/validationMiddleware");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../auth/auth.controller");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/user-profiles/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/all", getAllUsers);
router.get("/:id", getUserById);
// Protected Routes
router.post(
  "/",
  upload.single("avatar"),
  validate(userValidationSchema),
  createNewUser
);
router.use(protect);
router.get("/profile/followers", getMyFollowers);
router.get("/profile/followings", getMyFollowings);
router.post("/:id/follow", followUser);
router.patch("/:id", upload.single("avatar"), updateUserById);
router.delete("/:id", deleteUserById);

module.exports = router;
