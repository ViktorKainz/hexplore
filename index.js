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

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function createRoomId() {
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return io.sockets.adapter.rooms[id] ? createRoomId() : id;
}

function joinRoom(socket, room) {
    socket.rooms.forEach(room => {
        socket.leave(room);
    });
    socket.join(room);
    socket.emit("joined room", room);
}
