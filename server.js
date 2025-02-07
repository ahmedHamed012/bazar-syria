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
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
    socket.emit("joinedChat", { chatId, message: "You joined the chat." });
  });

  // Receive and Broadcast Messages
  socket.on("sendMessage", async (data) => {
    const { chatId, senderId, message } = data;

    if (!chatId || !senderId || !message) {
      return socket.emit("error", { message: "Missing required fields" });
    }

    try {
      // Save Message in Database (REST API Simulation)
      const savedMessage = await saveMessageToDatabase(
        chatId,
        senderId,
        message
      );

      // Broadcast Message to Other Users in the Chat
      socket.to(chatId).emit("receiveMessage", savedMessage);
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

// Function to Save Message in Database (Using REST API)
async function saveMessageToDatabase(chatId, senderId, message) {
  try {
    const response = await fetch("https://pzsyria.com/api/chat/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, senderId, message }),
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
