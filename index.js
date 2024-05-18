require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyPaser = require("body-parser");
const cors = require("cors");
// const { cw_endpoint } = require("./src/constant/endpoint");
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
    console.log(`user ${userName} joined`);
    users[userName] = socket.id;
    console.log(users);
    // console.log(`${userName} has read ${hasRead}`);
    const condition = true;
  });

  app.post("/webhook/new_message", async (req, res) => {
    try {
      const data = req.body;

      if (data) {
        const { receiverName } = data;
        const receiverSocketId = users[receiverName];
        io.to(receiverSocketId).emit("newMessage", receiverName);
        console.log("New webhook request", data);
        res.status(200).json({ message: "request reached webhook" });
      }
    } catch {
      res.status(500).send("Internal server Error");
    }
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

// import Routes from the Routes folder
// const webHookRoute = require("./src/routes/webHookRoute");

// use Route
// app.use("/webhook", webHookRoute);
// module.exports = { io };

server.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
