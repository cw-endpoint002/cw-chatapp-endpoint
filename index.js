require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyPaser = require("body-parser");
const cors = require("cors");
// const axios = require("axios");

const app = express();
const server = http.createServer(app);
// const socketIo = require("socket.io")(server);

// Enable CORS for all routes
app.use(cors());
app.use(bodyPaser.json());

const PORT = process.env.PORT || 4000;

// Configure Socket.IO to allow CORS from your client's origin
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://dualipa-membership.netlify.app",
      "https://cw-admin-client.netlify.app",
    ],
    methods: ["Get", "POST", "PUT", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"],
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("join", (userName) => {
    users[userName] = socket.id;
    console.log(users);
  });

  // console.log(users);

  socket.on("isTyping", (receiverName) => {
    const recieverSocketId = users[receiverName];
    io.to(recieverSocketId).emit("isTyping");
  });
  socket.on("typingStoped", (receiverName) => {
    const recieverSocketId = users[receiverName];
    io.to(recieverSocketId).emit("typingStoped");
  });

  socket.on("message", (receiverName, message) => {
    const recieverSocketId = users[receiverName];
    console.log(receiverName, message);
    io.to(recieverSocketId).emit("message", message);
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    delete users[userId];
    console.log("A client disconnected!");
  });
});

server.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
