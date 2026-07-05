const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {
    left: null,
    right: null
};

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    if (!players.left) {
        players.left = socket.id;
        socket.emit("role", "left");
    } else if (!players.right) {
        players.right = socket.id;
        socket.emit("role", "right");
    } else {
        socket.emit("role", "spectator");
    }

    socket.on("disconnect", () => {
        if (players.left === socket.id) players.left = null;
        if (players.right === socket.id) players.right = null;
        console.log("Disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});