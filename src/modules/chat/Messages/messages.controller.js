const catchAsync = require("../../../utils/catchAsync");
const Message = require("./messages.schema");
const Chat = require("../chat.schema");

exports.sendMessage = catchAsync(async (req, res) => {
  const { chatId, sender, content } = req.body;
  const attachment = req.file ? req.file.path : null;

  const message = new Message({ chatId, sender, content, attachment });
  await message.save();

  // Update last message in chat
  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  // Emit via WebSocket
  req.io.to(chatId).emit("receiveMessage", message);

  res.status(201).json(message);
});

exports.getMessages = catchAsync(async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId }).populate(
    "sender",
    "username email"
  );
  res.status(200).json(messages);
});
