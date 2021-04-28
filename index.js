import express from "express";
import {Server} from "socket.io";
import {Game} from "./private/game.js";

const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

app.use(express.static("public"));

const io = new Server(server);

io.on("connection", (socket) => {
    socket.on("disconnecting", () => {
        io.to(socket.room).emit("user disconnected", socket.id);
    });
    socket.on("create room", () => {
        joinRoom(socket, createRoomId());
        createGame(socket);
    });
    socket.on("join room", (room) => {
        if(typeof getRoom(room) === "undefined") {
            socket.emit("room not found");
        } else {
            joinRoom(socket, room);
        }
    });
    socket.on("set name", (name) => {
        socket.name = name;
        io.to(socket.room).emit("new name", socket.id, socket.name);
    });
    socket.on("get tile", (x, y) => {
        socket.emit("set tile", x, y, getGame(socket).board.getTile(x, y));
    });
});

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function createRoomId() {
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return getRoom(id) ? createRoomId() : id;
}

function joinRoom(socket, room) {
    socket.rooms.forEach(room => {
        socket.leave(room);
    });
    socket.join(room);
    socket.room = room;
    socket.emit("joined room", room);
}

function getRoom(socket) {
    return io.sockets.adapter.rooms.get(socket.room)
}

function createGame(socket) {
    getRoom(socket).game = new Game();
}

function getGame(socket) {
    return getRoom(socket).game;
}
