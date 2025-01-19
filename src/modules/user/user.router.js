const express = require("express");
const {
  createNewUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("./user.controller");
const userValidationSchema = require("./user.validation");
const validate = require("../../utils/validationMiddleware");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/user-profiles/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/",
  upload.single("avatar"),
  validate(userValidationSchema),
  createNewUser
);
router.get("/all", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", upload.single("avatar"), updateUserById);
router.delete("/:id", deleteUserById);

module.exports = router;
