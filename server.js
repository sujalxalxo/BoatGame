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

    console.log("Players after connect:", players);

    socket.on("gameState", (state) => {
        socket.broadcast.emit("gameState", state);
    });

    socket.on("disconnect", () => {

        console.log("Disconnected:", socket.id);

        if (players.left === socket.id) {
            players.left = null;
        }

        if (players.right === socket.id) {
            players.right = null;
        }

        console.log("Players after disconnect:", players);

        io.emit("players", players);

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});