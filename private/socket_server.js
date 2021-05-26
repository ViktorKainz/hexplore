import {Server} from "socket.io";
import {Game} from "./game.js";

/**
 * Class that handles the communication with the clients
 */
export class SocketServer {

    #io;

    constructor(server) {
        this.#io = new Server(server);

        /**
         * Handles the "connect" event.
         * Initialises the socket.
         */
        this.#io.on("connection", (socket) => {

            /**
             * Handles the "disconnecting" event.
             * Notifies all members of the room.
             */
            socket.on("disconnecting", () => {
                this.#io.to(socket.room).emit("user disconnected", socket.user);
            });

            /**
             * Handles the "create room" event.
             * Creates a room and lets the socket join it.
             */
            socket.on("create room", () => {
                this.#joinRoom(socket, this.#createRoomId());
                this.#createGame(socket);
            });

            /**
             * Handles the "join room" event.
             * Lets the socket join the specified room.
             * @param {string} room Room ID
             */
            socket.on("join room", (room) => {
                if(typeof this.#getRoom(room) === "undefined") {
                    socket.emit("room not found");
                } else {
                    this.#joinRoom(socket, room);
                }
            });

            /**
             * Handles the "set name" event.
             * Changes the name in the game instance and notifies all members of the room.
             * @param {string} name
             */
            socket.on("set name", (name) => {
                this.#getGame(socket).addPlayer(socket.user, name);
                this.#io.to(socket.room).emit("new name", this.#getGame(socket).getPlayer());
            });

            /**
             * Handles the "ready" event.
             * Sets the state of the player to ready and starts the game if everybody is.
             */
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

            /**
             * Handles the "get tile" event.
             * Sends the client the requested tile.
             * @param {int} x
             * @param {int} y
             */
            socket.on("get tile", (x, y) => {
                socket.emit("set tile", x, y, this.#getGame(socket).getTile(x, y));
            });

            /**
             * Handles the "get board" event.
             * Sends the client the board of the current game.
             */
            socket.on("get board", () => {
                socket.emit("set board", this.#getGame(socket).getBoard().map);
            });

            /**
             * Handles the "build building" event.
             * Constructs a building and notifies all members of the room.
             * @param {string} type
             * @param {int} x1
             * @param {int} y1
             * @param {int} x2
             * @param {int} y2
             * @param {int} x3
             * @param {int} y3
             */
            socket.on("build building", (type, x1, y1, x2, y2, x3, y3) => {
                switch (this.#getGame(socket).addBuilding(socket.user, type, x1, y1, x2, y2, x3, y3)) {
                    case true:
                        this.#io.to(socket.room).emit("new building", this.#getGame(socket).getBuildings());
                        this.#io.to(socket.room).emit("new resources", this.#getGame(socket).getResources());
                        break;
                    case "blocked": socket.emit("error", "locations is blocked");break;
                    case "resources": socket.emit("error", "not enough resources");
                }
            });

            /**
             * Handles the "build connection" event.
             * Constructs a connection and notifies all members of the room.
             * @param {string} type
             * @param {int} x1
             * @param {int} y1
             * @param {int} x2
             * @param {int} y2
             */
            socket.on("build connection", (type, x1, y1, x2, y2) => {
                switch (this.#getGame(socket).addConnection(socket.user, type, x1, y1, x2, y2)) {
                    case true:
                        this.#io.to(socket.room).emit("new connection", this.#getGame(socket).getConnections());
                        this.#io.to(socket.room).emit("new resources", this.#getGame(socket).getResources());
                        break;
                    case "blocked": socket.emit("error", "locations is blocked");break;
                    case "resources": socket.emit("error", "not enough resources");
                }
            });

            /**
             * Handles the "set user" event.
             * Sets the user ID to the specified value.
             * @param {int} user User ID
             */
            socket.on("set user", (user) => {
               socket.user = user;
            });

            /**
             * Handles the "set user" event.
             * Distributes Resources to the player and starts the next turn.
             */
            socket.on("next turn", () => {
                this.#io.to(socket.room).emit("new resources", this.#getGame(socket).distributeResources());
                this.#io.to(socket.room).emit("next turn", this.#getGame(socket).getNextTurn());
                this.#io.to(socket.room).emit("round", this.#getGame(socket).getRound());
                this.#io.to(socket.room).emit("round", this.#getGame(socket).getRound());
            });

            /**
             * Handles the "exchange resources" event.
             * Exchanges 4 resources of a player into another
             * @param {Object} input Resources
             * @param {Object} output Resources
             */
            socket.on("exchange resources", (input, output) => {
                if(this.#getGame(socket).exchangeResources(socket.user, input, output)) {
                    this.#io.to(socket.room).emit("new resources", this.#getGame(socket).getResources());
                } else {
                    socket.emit("error", "invalid amount of resources");
                }
            });

            /**
             * Handles the "send message" event.
             * Sends the specified message to all members of the room
             * @param {string} message
             */
            socket.on("send message", (message) => {
                this.#io.to(socket.room).emit("new message", socket.user, message);
            })
        });
    }

    #characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    /**
     * Returns a valid room id
     * @returns {string} Room ID
     */
    #createRoomId() {
        let id = "";
        for (let i = 0; i < 6; i++) {
            id += this.#characters.charAt(Math.floor(Math.random() * this.#characters.length));
        }
        return this.#getRoom(id) ? this.#createRoomId() : id;
    }

    /**
     * Lets the socket join the specified room
     * @param {Socket} socket
     * @param {string} room
     */
    #joinRoom(socket, room) {
        socket.rooms.forEach(room => {
            socket.leave(room);
        });
        socket.join(room);
        socket.room = room;
        socket.emit("joined room", room);
    }

    /**
     * Returns the room with the specified id
     * @param {string} room
     * @returns {Set<string>|undefined} Room
     */
    #getRoom(room) {
        return this.#io.sockets.adapter.rooms.get(room)
    }

    /**
     * Creates a new game instance for the current room
     * @param {Socket} socket
     */
    #createGame(socket) {
        this.#getRoom(socket.room).game = new Game();
    }

    /**
     * Returns the game instance of the current room
     * @param {Socket} socket
     * @returns {Game}
     */
    #getGame(socket) {
        return this.#getRoom(socket.room).game;
    }
}
