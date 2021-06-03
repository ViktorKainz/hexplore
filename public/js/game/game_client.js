import {Board} from "./board.js";
import {DrawBoard} from "../utility/draw_board.js";
import {Assets} from "../utility/assets.js";

/**
 * Class that handles the display of the game and the input of the player
 */
export class GameClient {
    #board;
    #buildings = [];
    #connections = [];
    #player = {};
    #ready = {};

    constructor() {
        this.input = false;
        this.#board = new Board();
        this.assets = new Assets();
        this.assets.addEventListener("loaded", (e) => {
            this.draw = new DrawBoard();
            socket.getPreview();
        });
        this.assets.load();
    }

    /**
     * Draws the board on the canvas
     */
    drawBoard() {
        this.draw.drawAssets(this.#board, this.assets);
    }

    /**
     * Signals the DrawBoard class that the window has been resized
     */
    resize() {
        this.draw.resize();
    }

    /**
     * Regenerates the lobby screen
     */
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

    /**
     * Handles an onkeypress event
     * @param {KeyboardEvent} e
     */
    keyHandler(e) {
        if(window.gameClient.input) {
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
    }

    /**
     * Returns the Tile on the specified coordinates
     * @param {int} x
     * @param {int} y
     * @returns {Tile|undefined}
     */
    getTile(x, y) {
        if (typeof this.#board.getTile(x, y) == "undefined") {
            socket.getTile(x, y);
            return undefined;
        }
        return this.#board.getTile(x, y);
    }

    /**
     * Sets the Tile on the specified coordinates
     * @param {int} x
     * @param {int} y
     * @param {Tile} tile
     */
    setTile(x, y, tile) {
        this.#board.setTile(x, y, tile);
    }

    /**
     * Sets the board of the game
     * @param {Board} board
     */
    setBoard(board) {
        this.#board.map = board;
        this.drawBoard();
    }

    /**
     * Sets the constructed buildings
     * @param {Building[]} buildings
     */
    setBuildings(buildings) {
        this.#buildings = buildings;
    }

    /**
     * Sets the constructed connections
     * @param {Connection[]} connections
     */
    setConnections(connections) {
        this.#connections = connections;
    }

    /**
     * Sets the player ids and names
     * @param {{}} player
     */
    setPlayer(player) {
        this.#player = player;
    }

    /**
     * Returns an object with the ids and names of the player
     * @returns {{}} Names of player
     */
    getPlayer() {
        return this.#player;
    }

    /**
     * Sets the ready status of the player
     * @param {{}} ready
     */
    setReady(ready) {
        this.#ready = ready;
    }
}
