const express = require("express");
const { createChat, getUserChats } = require("./chat.controller");
const { sendMessage, getMessages } = require("./Messages/messages.controller");
const router = express.Router();
const { protect } = require("../auth/auth.controller");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/chats-attachments/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.use(protect);
router.post("/", createChat);
router.get("/", getUserChats);

router.post("/messages", upload.single("attachment"), sendMessage);
router.get("/messages/:chatId", getMessages);

module.exports = router;
