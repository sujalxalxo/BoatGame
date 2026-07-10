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

function assignPlayer(socket) {

    if (!players.left) {
        players.left = socket.id;
        socket.emit("role", "left");
        return;
    }

    if (!players.right) {
        players.right = socket.id;
        socket.emit("role", "right");
        return;
    }

    socket.emit("role", "full");
}

io.on("connection", (socket) => {
console.log("Connected:", socket.id);

assignPlayer(socket);

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