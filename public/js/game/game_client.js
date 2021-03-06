import {Board} from "./board.js";
import {DrawBoard} from "../gui/draw_board.js";
import {Assets} from "../gui/assets.js";
import {BUILDING_TYPES} from "./building.js";

/**
 * Class that handles the display of the game and the input of the player
 * @author Viktor Kainz
 */
export class GameClient {
    #board;
    #buildings = [];
    #connections = [];
    #player = {};
    #ready = {};
    #points = {};
    #colors = {};
    #playerAssets = {};

    constructor() {
        this.input = false;
        this.myTurn = false;
        this.#board = new Board();
        this.assets = new Assets();
        this.assets.addEventListener("loaded", (e) => {
            this.draw = new DrawBoard();
            socketClient.getPreview();
        });
        this.assets.load();
    }

    /**
     * Draws the board on the canvas
     */
    drawBoard() {
        this.draw.drawBackground();
        this.draw.drawTiles(this.#board);
        this.draw.drawConnection(this.#connections);
        this.draw.drawBuilding(this.#buildings);
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
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.innerText = Object.keys(this.#player).length + " of 6";
        td.setAttribute("colspan", "2");
        td.style.textAlign = "center";
        tr.appendChild(td);
        table.appendChild(tr);
        for (let p in this.#player) {
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

    updatePoints() {
        let table = document.getElementById("points");
        table.innerHTML = "";
        for (let p in this.#points) {
            let tr = document.createElement("tr");
            let name = document.createElement("td");
            name.innerText = this.#player[p];
            name.style.color = this.#colors[p];
            tr.appendChild(name);
            let points = document.createElement("td");
            points.innerText = this.#points[p];
            tr.appendChild(points);
            table.appendChild(tr);
        }
    }

    /**
     * Handles an onkeypress event
     * @param {KeyboardEvent} e
     */
    keyHandler(e) {
        if (window.gameClient.input) {
            let draw = window.gameClient.draw;
            switch (e.key) {
                case "w":
                    draw.yOffset += 5;
                    break;
                case "s":
                    draw.yOffset -= 5;
                    break;
                case "a":
                    draw.xOffset += 5;
                    break;
                case "d":
                    draw.xOffset -= 5;
                    break;
                case "c":
                    draw.yOffset = 0;
                    draw.xOffset = 0;
                    break;
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
            socketClient.getTile(x, y);
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
     * Sets the player colors
     * @param {{}} colors
     */
    async setColors(colors) {
        this.#colors = colors;
        for (let i in colors) {
            if (typeof this.#playerAssets[i] == "undefined") {
                let assets = [];
                assets[BUILDING_TYPES.HOUSE] = await this.assets.loadSVGcolored("house", colors[i]);
                assets[BUILDING_TYPES.CITY] = await this.assets.loadSVGcolored("city", colors[i]);
                this.#playerAssets[i] = assets;

            }
        }
    }

    /**
     * Returns an object with the ids and names of the player
     * @returns {{}} Names of player
     */
    getPlayer() {
        return this.#player;
    }

    /**
     * Returns an object with the ids and colors of the player
     * @returns {{}} Names of player
     */
    getColors() {
        return this.#colors;
    }

    /**
     * Sets the ready status of the player
     * @param {{}} ready
     */
    setReady(ready) {
        this.#ready = ready;
    }

    /**
     * Sets the points of player
     * @param {{}} points
     */
    setPoints(points) {
        this.#points = points;
        this.updatePoints();
    }

    /**
     * Displays an error
     * @param {string} error
     */
    showError(error) {
        let table = document.getElementById("error");
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        let button = document.createElement("td");
        let spacer = document.createElement("tr");
        td.innerText = error;
        tr.append(td);
        button.setAttribute("onclick", "removeError(this)");
        button.innerText = "✖";
        tr.append(button);
        table.append(tr);
        spacer.classList.add("spacer");
        table.append(spacer);
        setTimeout(() => {
            window.removeError(button);
        }, 10000);
    }

    /**
     * Checks whether it is the player's turn
     * @param {int} player
     */
    setTurn(player) {
        this.myTurn = player === socketClient.socket.user;
        if (this.myTurn) {
            document.getElementById("current").style.display = "none";
            document.getElementById("next").style.display = "block";
        } else {
            document.getElementById("next").style.display = "none";
            let c = document.getElementById("current");
            c.style.display = "block";
            c.innerText = "Waiting for " + this.#player[player];
        }
    }

    /**
     * Displays the winner of the game
     * @param {int} player
     */
    setWinner(player) {
        document.getElementById("game").style.display = "none";
        document.getElementById("win").style.display = "block";
        document.getElementsByClassName("pyro")[0].style.display = "block";
        document.getElementById("winner").innerText = "The player " + this.#player[player] + " has won with " + this.#points[player] + " points!";
    }

    /**
     * Returns the assets of the specified player
     * @param {int} player
     * @returns {*}
     */
    getPlayerAssets(player) {
        return this.#playerAssets[player];
    }

    /**
     * Displays the message and the player name
     * @param{int} player
     * @param {string} message
     */
    displayMessage(player, message) {
        let user = document.createElement("td");
        user.innerText = this.#player[player];
        user.style.color = this.#colors[player];
        let text = document.createElement("td");
        text.innerText = message;
        let tr = document.createElement("tr");
        tr.appendChild(user);
        tr.appendChild(text);
        let table =  document.getElementById("messages");
        table.append(tr);
        table.scrollTop = table.scrollHeight;
    }
}
