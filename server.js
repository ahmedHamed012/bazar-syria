const express = require("express");
const app = require("./src/app"); // Import app
require("dotenv").config();
const passport = require("passport");
require("./src/config/passport");
const db = require("./src/config/db");

const http = require("http").createServer(app); // Create HTTP server
const io = require("socket.io")(http); // Attach Socket.IO to the HTTP server

const PORT = process.env.PORT || 5000;
app.use(passport.initialize());

// Handle WebSocket Connections
io.on("connection", (socket) => {
  console.log(`🟢 New client connected: ${socket.id}`);

  // Client joins a chat room
  socket.on("joinChat", async (chatId) => {
    socket.join(chatId.chatId);
    console.log(`User ${socket.id} joined chat ${chatId.chatId}`);
    try {
      // Fetch previous messages from API
      const messages = await fetchChatHistory(chatId.chatId);
      socket.emit("chatHistory", messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      socket.emit("error", { message: "Failed to fetch chat history" });
    }

    socket.emit("joinedChat", { chatId, message: "You joined the chat." });
  });

  // Receive and Broadcast Messages
  socket.on("sendMessage", async (data) => {
    const { chatId, senderId, message } = data;

    if (!chatId || !senderId || !message) {
      return socket.emit("error", { message: "Missing required fields" });
    }

    try {
      // Save Message in Database
      const savedMessage = await saveMessageToDatabase(
        chatId,
        senderId,
        message
      );

      // Broadcast Message to Other Users in the Chat
      socket.to(chatId).emit("receiveMessage", savedMessage);

      // Send the message back to the sender as well
      socket.emit("receiveMessage", savedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// Function to Fetch Chat History (Using REST API)
async function fetchChatHistory(chatId) {
  try {
    const response = await fetch(
      `https://pzsyria.com/api/chat/messages/${chatId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }
    return await response.json(); // Return chat history
  } catch (error) {
    throw error;
  }
}

// Function to Save Message in Database (Using REST API)
async function saveMessageToDatabase(chatId, senderId, message) {
  try {
    const response = await fetch("https://pzsyria.com/api/chat/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId, sender: senderId, content: message }),
    });

    if (!response.ok) {
      throw new Error("Failed to save message");
    }

    return await response.json(); // Return saved message
  } catch (error) {
    throw error;
  }
}

// Start server using `http.listen()` instead of `app.listen()`
http.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
