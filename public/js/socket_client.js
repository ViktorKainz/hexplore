export class SocketClient {

    constructor() {
        this.socket = io();
        this.user = [];

        this.socket.on("connect", () => {
            console.log("connected")
        });

        this.socket.on("joined room", (room) => {
            this.user = [];
            document.getElementById("room").innerText = room;
            document.getElementById("overlay").style.display = "none";
            document.getElementById("canvas").style.display = "block";
            this.getBoard();
        });

        this.socket.on("room not found", () => {
            alert("Requested room does not exist.");
        });

        this.socket.on("new name", (id, name) => {
            this.user[id] = name;
            console.log(this.user);
        });

        this.socket.on("user disconnected", (id) => {
            console.log(this.user[id] + " disconnected");
            this.user.splice(id,1);
        })

        this.socket.on("set tile", (x, y, tile) => {
            gameClient.setTile(x, y, tile);
        });

        this.socket.on("set board", (board) => {
            gameClient.setBoard(board);
        })
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
}
