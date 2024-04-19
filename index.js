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
    origin: "http://localhost:5173",
    methods: ["Get", "POST"],
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

  console.log(users);

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

// const getUserData = async (token) => {
//   try {
//     console.log(token);
//     const config = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };
//     const res = await axios.get(
//       `http://localhost:3000/api/fetchUserData`,
//       config
//     );

//     const user = res.data;
//     if (user.status === 200) {
//       return user;
//     } else {
//       throw new Error(`Request failed with status code ${response.status}`);
//     }
//   } catch (err) {
//     console.log("Error getting user data", err, err.message);
//   }
// };

server.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
