import express from "express";
import {Server} from "socket.io";

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
        io.to(socket.rooms.keys().next().value).emit("user disconnected", socket.id);
    });
    socket.on("create room", () => {
        joinRoom(socket, createRoomId());
    });
    socket.on("join room", (room) => {
        if(typeof io.sockets.adapter.rooms.get(room) === "undefined") {
            socket.emit("room not found");
        } else {
            joinRoom(socket, room);
        }
    });
    socket.on("set name", (name) => {
        socket.name = name;
        io.to(socket.rooms.keys().next().value).emit("new name", socket.id, socket.name);
    });
});

function createRoomId() {
    let result = [];
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    let output = result.join("");
    if (io.sockets.adapter.rooms[output]) {
        return createRoomId();
    } else {
        return output;
    }
}

function joinRoom(socket, room) {
    socket.rooms.forEach(room => {
        socket.leave(room);
    });
    socket.join(room);
    socket.emit("joined room", room);
}
