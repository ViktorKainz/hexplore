import {Server} from "socket.io";
import {Game} from "./game.js";

export class SocketServer {

    #io;

    constructor(server) {
        this.#io = new Server(server);

        this.#io.on("connection", (socket) => {

            socket.on("disconnecting", () => {
                this.#io.to(socket.room).emit("user disconnected", socket.user);
            });

            socket.on("create room", () => {
                this.#joinRoom(socket, this.#createRoomId());
                this.#createGame(socket);
            });

            socket.on("join room", (room) => {
                if(typeof this.#getRoom(room) === "undefined") {
                    socket.emit("room not found");
                } else {
                    this.#joinRoom(socket, room);
                }
            });

            socket.on("set name", (name) => {
                this.#getGame(socket).addPlayer(socket.user, name);
                this.#io.to(socket.room).emit("new name", this.#getGame(socket).getPlayer());
            });

            socket.on("ready", () => {
                this.#getGame(socket).setReady(socket.user);
                if(this.#getGame(socket).isReady()) {
                    this.#io.to(socket.room).emit("start");
                    this.#io.to(socket.room).emit("next turn", this.#getGame(socket).getNextTurn());
                    this.#io.to(socket.room).emit("round", this.#getGame(socket).getRound());
                } else {
                    this.#io.to(socket.room).emit("ready", this.#getGame(socket).getReady());
                }
            });

            socket.on("get tile", (x, y) => {
                socket.emit("set tile", x, y, this.#getGame(socket).getTile(x, y));
            });

            socket.on("get board", () => {
                socket.emit("set board", this.#getGame(socket).getBoard().map);
            });

            socket.on("build building", (type, x1, y1, x2, y2, x3, y3) => {
                switch (this.#getGame(socket).addBuilding(socket.user, type, x1, y1, x2, y2, x3, y3)) {
                    case true:
                        this.#io.to(socket.room).emit("new building", this.#getGame(socket).getBuildings());
                        this.#io.to(socket.room).emit("new resources", this.#getGame(socket).getResources());
                        break;
                    case "blocked": socket.emit("building error", "locations is blocked");
                    case "resources": socket.emit("building error", "not enough resources");
                }
            });

            socket.on("build connection", (type, x1, y1, x2, y2) => {
                switch (this.#getGame(socket).addConnection(socket.user, type, x1, y1, x2, y2)) {
                    case true:
                        this.#io.to(socket.room).emit("new connection", this.#getGame(socket).getConnections());
                        this.#io.to(socket.room).emit("new resources", this.#getGame(socket).getResources());
                        break;
                    case "blocked": socket.emit("building error", "locations is blocked");
                    case "resources": socket.emit("building error", "not enough resources");
                }
            });

            socket.on("set user", (user) => {
               socket.user = user;
            });

            socket.on("next turn", () => {
                this.#io.to(socket.room).emit("new resources", this.#getGame(socket).distributeResources());
                this.#io.to(socket.room).emit("next turn", this.#getGame(socket).getNextTurn());
                this.#io.to(socket.room).emit("round", this.#getGame(socket).getRound());
            })
        });
    }

    #characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    #createRoomId() {
        let id = "";
        for (let i = 0; i < 6; i++) {
            id += this.#characters.charAt(Math.floor(Math.random() * this.#characters.length));
        }
        return this.#getRoom(id) ? this.#createRoomId() : id;
    }

    #joinRoom(socket, room) {
        socket.rooms.forEach(room => {
            socket.leave(room);
        });
        socket.join(room);
        socket.room = room;
        socket.emit("joined room", room);
    }

    #getRoom(room) {
        return this.#io.sockets.adapter.rooms.get(room)
    }

    #createGame(socket) {
        this.#getRoom(socket.room).game = new Game();
    }

    #getGame(socket) {
        return this.#getRoom(socket.room).game;
    }
}
