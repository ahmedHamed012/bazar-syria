const catchAsync = require("../../utils/catchAsync");
const Chat = require("./chat.schema");

exports.createChat = catchAsync(async (req, res, next) => {
  const { users, isGroup, name } = req.body;

  const chat = new Chat({ users, isGroup, name });
  await chat.save();
  res.status(201).json(chat);
});

exports.getUserChats = catchAsync(async (req, res) => {
  const chats = await Chat.find({ users: req.user.id }).populate(
    "users",
    "username email"
  );
  res.status(200).json(chats);
});
