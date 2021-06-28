/**
 * Class that handles the communication with the server
 * @author Viktor Kainz
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
            this.socket.user = parseInt(localStorage.getItem("user"));
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
            document.getElementById("invitation").innerHTML = "Invitation: <a href='" + location.href + "?" + room + "'>" + location.href + "?" + room + "</a>";
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
         * Handles the "new color" event.
         * Sets the player color in the game client and updates the lobby.
         * @param {{}} colors
         */
        this.socket.on("new color", (colors) => {
            gameClient.setColors(colors);
        });

        /**
         * Handles the "user disconnected" event.
         * @param {int} id
         */
        this.socket.on("user disconnected", (id) => {
            gameClient.displayMessage(id, "has disconnected!");
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
            document.getElementById("menu").style.display = "none";
            document.getElementById("game").style.display = "block";
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

        /**
         * Handles the "next turn" event.
         */
        this.socket.on("next turn", (player) => {
            gameClient.setTurn(player);
        });

        /**
         * Handles the "new resources" event.
         */
        this.socket.on("new resources", (resources) => {
            for (const [key, value] of Object.entries(resources[this.socket.user])) {
                document.getElementById(key).innerText = value;
            }
        });

        /**
         * Handles the "winner" event.
         */
        this.socket.on("winner", (player) => {
            gameClient.setWinner(player);
        });

        /**
         * Handles the "send message" event.
         */
        this.socket.on("new message", (player, message) => {
            gameClient.displayMessage(player, message);
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
     * @param {int} user
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

    /**
     * Tells the server that the player finished his turn
     */
    finish() {
        this.socket.emit("finished");
    }

    /**
     * Sends the server a request to exchange resources
     * @param {Resources} input
     * @param {Resources} output
     */
    exchange(input, output) {
        this.socket.emit("exchange resources", input, output);
    }

    /**
     * Sends a message to the other player
     * @param {string} message
     */
    sendMessage(message) {
        this.socket.emit("send message", message);
    }
}
