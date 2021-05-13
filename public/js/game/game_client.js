import {Board} from "./board.js";
import {DrawBoard} from "../utility/draw_board.js";
import {Assets} from "../utility/assets.js";

export class GameClient {
    #board;
    #buildings = [];
    #connections = [];
    #player = {};
    #ready = {};

    constructor() {
        this.#board = new Board();
        this.assets = new Assets();
        this.assets.addEventListener("loaded", (e) => {
            this.draw = new DrawBoard();
        });
        this.assets.load();
    }

    drawBoard() {
        this.draw.drawAssets(this.#board, this.assets);
    }

    resize() {
        this.draw.resize();
    }

    updateLobby() {
        let table = document.getElementById("player");
        table.innerHTML = "";
        for(let p in this.#player) {
            let tr = document.createElement("tr");
            let name = document.createElement("td");
            name.innerText = this.#player[p];
            tr.appendChild(name);
            let status = document.createElement("td");
            status.innerText = this.#ready[p] ? "✓" : "✗";
            status.setAttribute("class", this.#ready[p] ? "green" : "red");
            tr.appendChild(status);
            table.appendChild(tr);
        }
    }

    keyHandler(e) {
        let draw = window.gameClient.draw;
        switch (e.key) {
            case "w": draw.yOffset+=5; break;
            case "s": draw.yOffset-=5; break;
            case "a": draw.xOffset+=5; break;
            case "d": draw.xOffset-=5; break;
            case "c": draw.yOffset=0;
                      draw.xOffset=0; break;
        }
    }

    getTile(x, y) {
        if (typeof this.#board.getTile(x, y) == "undefined") {
            socket.getTile(x, y);
            return undefined;
        }
        return this.#board.getTile(x, y);
    }

    setTile(x, y, tile) {
        this.#board.setTile(x, y, tile);
    }

    setBoard(board) {
        this.#board.map = board;
        this.drawBoard();
    }

    setBuildings(buildings) {
        this.#buildings = buildings;
    }

    setConnections(connections) {
        this.#connections = connections;
    }

    setPlayer(player) {
        this.#player = player;
    }

    getPlayer() {
        return this.#player;
    }

    setReady(ready) {
        this.#ready = ready;
    }

    getReady() {
        return this.#ready;
    }
}
