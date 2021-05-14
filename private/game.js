import {Board} from "../public/js/game/board.js";
import {WorldGenerator} from "./world_genertator.js";
import {Building} from "../public/js/game/building.js";
import {Connection} from "../public/js/game/connection.js";

export class Game {

    #board;
    #buildings = [];
    #connections = [];
    #player = {};
    #ready = {};

    constructor() {
        this.#board = new Board();
        this.round = 1;
        WorldGenerator.generateCircle(this.#board, 0, 0, 5);
    }

    getTile(x, y) {
        WorldGenerator.generate(this.#board, x, y);
        return this.#board.getTile(x, y);
    }

    getBoard() {
        return this.#board;
    }

    addBuilding(player, type, x1, y1, x2, y2, x3, y3) {
        let coords = JSON.stringify([[x1, y1], [x2, y2], [x3, y3]].sort(Board.compareCoords));
        for (let b in this.#buildings) {
            let c = JSON.stringify(this.#buildings[b].coords);
            if(c == coords) {
                return false;
            }
        }
        this.#buildings.push(new Building(player, type, x1, y1, x2, y2, x3, y3));
        return true;
    }

    addConnection(player, type, x1, y1, x2, y2) {
        let coords = JSON.stringify([[x1, y1], [x2, y2]].sort(Board.compareCoords));
        for (let con in this.#connections) {
            let c = JSON.stringify(this.#connections[con].coords);
            if(c == coords) {
                return false;
            }
        }
        this.#connections.push(new Connection(player, type, x1, y1, x2, y2));
        return true;
    }

    addPlayer(id, name) {
        this.#player[id] = name;
        this.#ready[id] = false;
    }

    getBuildings() {
        return this.#buildings;
    }

    getConnections() {
        return this.#connections;
    }

    getPlayer() {
        return this.#player;
    }

    setReady(id) {
        this.#ready[id] = true;
    }

    getReady() {
        return this.#ready;
    }

    isReady() {
        for (let r in this.#ready) {
            if(!this.#ready[r]) {
                return false;
            }
        }
        return true;
    }
}
