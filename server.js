const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { spawn } = require("child_process");  
const formatMessage = require("./utils/message");
const {
  userJoin,
  getCurrUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "CryptoChat";

//run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //Welcome current user
    socket.emit(
      "message",
      formatMessage(botName, `Hi ${user.username}! Welcome to CryptoChat!`, false)
    );

    //Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`, false)
      );

    //Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Chat Message
  socket.on("chatMessage", (msg) => {
    const user = getCurrUser(socket.id);

    const pythonProcess = spawn("python", ["encryption.py", "encrypt", msg]); //

    pythonProcess.stdout.on("data", (encryptedMessage) => {  //
      // console.log(JSON.parse(encryptedMessage));
      io.to(user.room).emit("message", formatMessage(`${user.username}`, JSON.parse(encryptedMessage), true));
    });  //
  });

  // Decrypt Message
  socket.on("decryptMessage", ({ encryptedMessage, secretKey, messager }) => {
    // Spawn a Python process to decrypt the message
    const pythonProcess = spawn("python", ["encryption.py", "decrypt", encryptedMessage, secretKey]);

    pythonProcess.stdout.on("data", (decryptedMessage) => {
      // Emit the decrypted message back to the client
      // console.log(encryptedMessage, messager);
      socket.emit("decryptedMessage", formatMessage(messager, decryptedMessage.toString(), false));
    });
  });

  //Runs when user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`, "")
      );
      //Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


