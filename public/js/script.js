const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//Username and Room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log(username, room);

const socket = io();

//Join Chat Room
socket.emit("joinRoom", { username, room });

//Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  
  if (message.isEncrypted==true) {
    console.log(message);
    outputEncryptedMessage(message);
  } else {
    outputMessage(message);
  }
  //Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.value.focus();
});

// Handle decryption of encrypted messages
function decryptMessage(encryptedMessage, messager) {
  const secretKey = prompt(
    "Please enter the secret key to decrypt the message:"
  );
  if (secretKey) {
    socket.emit("decryptMessage", { encryptedMessage, secretKey, messager });
  }
}

// Display the received decrypted message
socket.on("decryptedMessage", (decryptedMessage) => {
  // Display the decrypted message on the client-side interface
  outputMessage(decryptedMessage);
});

//output encrypted message
function outputEncryptedMessage(message) {
  const div = document.createElement("div");

  div.classList.add("message");

  if (username == message.username) {
    div.classList.add("right");
    div.classList.add("yourMessageColor");
  } else if (message.username == "CryptoChat") {
    div.classList.add("center");
  } else {
    div.classList.add("left");
  }

  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text"> ${message.text} </p>
    <button onclick="decryptMessage('${message.text}', '${message.username}')">Decrypt</button>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");

  div.classList.add("message");

  if (username == message.username) {
    div.classList.add("right");
    div.classList.add("yourMessageColor");
  } else if (message.username == "CryptoChat") {
    div.classList.add("center");
  } else {
    div.classList.add("left");
  }

  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text"> ${message.text} </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}

//Leave room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  }
});
