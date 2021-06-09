/**
 * Class that handles the communication with the server
 */

export class SocketClient {

    constructor() {
        this.socket = io();

        /**
         * Handles the "connect" event.
         * Sets the id of the user.
         */
        this.socket.on("connect", () => {
            if (localStorage.getItem("user") == null) {
                localStorage.setItem("user", (Math.floor(Math.random() * Date.now()) + ""));
            }
            this.socket.user = localStorage.getItem("user");
            this.setUser(this.socket.user);
        });

        /**
         * Handles the "joined room" event.
         * Shows the room id and switches to the lobby screen.
         * @param {string} room
         */
        this.socket.on("joined room", (room) => {
            document.getElementById("room").innerText = room;
            document.getElementById("form").style.display = "none";
            document.getElementById("lobby").style.display = "block";
        });

        /**
         * Handles the "join error" event.
         * Shows an alert.
         */
        this.socket.on("join error", (error) => {
            alert(error);
        });

        /**
         * Handles the "new name" event.
         * Sets the player names in the game client and updates the lobby.
         * @param {{}} names
         */
        this.socket.on("new name", (names) => {
            gameClient.setPlayer(names);
            gameClient.updateLobby();
        });

        /**
         * Handles the "user disconnected" event.
         * @param {int} id
         */
        this.socket.on("user disconnected", (id) => {
            console.log(gameClient.getPlayer()[id]);
        })

        /**
         * Handles the "set tile" event.
         * @param {int} x
         * @param {int} y
         * @param {Object} tile
         */
        this.socket.on("set tile", (x, y, tile) => {
            gameClient.setTile(x, y, tile);
        });

        /**
         * Handles the "set board" event.
         * @param {*[]} board
         */
        this.socket.on("set board", (board) => {
            gameClient.setBoard(board);
        });

        /**
         * Handles the "new building" event.
         * @param {Object[]} buildings
         */
        this.socket.on("new building", (buildings) => {
            gameClient.setBuildings(buildings);
        });

        /**
         * Handles the "new connection" event.
         * @param {Object[]} connections
         */
        this.socket.on("new connection", (connections) => {
            gameClient.setConnections(connections)
        });

        /**
         * Handles the "ready" event.
         * Changes the ready state of the player.
         * @param {Object} ready
         */
        this.socket.on("ready", (ready) => {
            gameClient.setReady(ready);
            gameClient.updateLobby();
            if (ready[this.socket.user]) {
                document.getElementById("ready").style.display = "none";
            }
        });

        /**
         * Handles the "start" event.
         * Switches to the game screen and requests the board
         */
        this.socket.on("start", () => {
            document.getElementById("overlay").style.display = "none";
            document.getElementById("canvas").style.display = "block";
            gameClient.input = true;
            this.getBoard();
        });

        /**
         * Handles the "round" event.
         * Changes the round counter.
         */
        this.socket.on("round", (round) => {
            document.getElementById("round").innerText = round;
        });

        /**
         * Handles the "error" event.
         * Displays an error message.
         */
        this.socket.on("error", (error) => {
            gameClient.showError(error);
        });

        /**
         * Handles the "points" event.
         */
        this.socket.on("points", (points) => {
            gameClient.setPoints(points);
        });
    }

    /**
     * Sends the server a request to create a room
     */
    createRoom() {
        this.socket.emit("create room");
    }

    /**
     * Sends the server a request to join the room with the specified room id
     * @param {string} room
     */
    joinRoom(room) {
        this.socket.emit("join room", room);
    }

    /**
     * Sends the server a request to change the name of the player
     * @param {string} name
     */
    changeName(name) {
        this.socket.emit("set name", name);
    }

    /**
     * Sends the server a request to get the tile with the specified coordinates
     * @param {int} x
     * @param {int} y
     */
    getTile(x, y) {
        this.socket.emit("get tile", x, y);
    }

    /**
     * Sends the server a request to get the current board
     */
    getBoard() {
        this.socket.emit("get board");
    }

    /**
     * Sends the server a request to construct a building with the specified type on the specified coordinates
     * @param {string} type
     * @param {int} x1
     * @param {int} y1
     * @param {int} x2
     * @param {int} y2
     * @param {int} x3
     * @param {int} y3
     */
    addBuilding(type, x1, y1, x2, y2, x3, y3) {
        this.socket.emit("build building", type, x1, y1, x2, y2, x3, y3);
    }

    /**
     * Sends the server a request to construct a connection with the specified type on the specified coordinates
     * @param {string} type
     * @param {int} x1
     * @param {int} y1
     * @param {int} x2
     * @param {int} y2
     */
    addConnection(type, x1, y1, x2, y2) {
        this.socket.emit("build connection", type, x1, y1, x2, y2);
    }

    /**
     * Sends the server that the player is ready
     */
    setReady() {
        this.socket.emit("ready");
    }

    /**
     * Sends the server the id of the user
     * @param {id} user
     */
    setUser(user) {
        this.socket.emit("set user", user);
    }

    /**
     * Sends the server a request to get a preview board
     */
    getPreview() {
        this.socket.emit("get preview");
    }
}
