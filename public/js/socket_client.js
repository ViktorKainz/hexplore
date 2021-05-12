export class SocketClient {

    constructor() {
        this.socket = io();

        this.socket.on("connect", () => {
            console.log("connected");
        });

        this.socket.on("joined room", (room) => {
            document.getElementById("room").innerText = room;
            document.getElementById("overlay").style.display = "none";
            document.getElementById("canvas").style.display = "block";
            this.getBoard();
        });

        this.socket.on("room not found", () => {
            alert("Requested room does not exist.");
        });

        this.socket.on("new name", (names) => {
            gameClient.setPlayer(names);
        });

        this.socket.on("user disconnected", (id) => {
            console.log(gameClient.getPlayer()[id]);
        })

        this.socket.on("set tile", (x, y, tile) => {
            gameClient.setTile(x, y, tile);
        });

        this.socket.on("set board", (board) => {
            gameClient.setBoard(board);
        });

        this.socket.on("new building", (buildings) => {
            gameClient.setBuildings(buildings);
        });

        this.socket.on("new connection", (connections) => {
            gameClient.setConnections(connections)
        });
    }

    createRoom() {
        this.socket.emit("create room");
    }

    joinRoom(room) {
        this.socket.emit("join room", room);
    }

    changeName(name) {
        this.socket.emit("set name", name);
    }

    getTile(x, y) {
        this.socket.emit("get tile", x, y);
    }

    getBoard() {
        this.socket.emit("get board");
    }

    addBuilding(type, x1, y1, x2, y2, x3, y3) {
        this.socket.emit("build building", type, x1, y1, x2, y2, x3, y3);
    }

    addConnection(type, x1, y1, x2, y2) {
        this.socket.emit("build connection", type, x1, y1, x2, y2);
    }
}
