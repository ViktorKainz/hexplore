import {Board} from "../public/js/game/board.js";
import {WorldGenerator} from "./world_genertator.js";
import {Building, BUILDING_COSTS, BUILDING_TYPES} from "../public/js/game/building.js";
import {Connection, CONNECTION_COSTS, CONNECTION_TYPES} from "../public/js/game/connection.js";
import {Resources} from "../public/js/game/resources.js";
import {TILE_TYPES} from "../public/js/game/tile.js";

export class Game {

    #board;
    #buildings = [];
    #connections = [];
    #player = {};
    #ready = {};
    #resources = {};
    #round;
    #turn;

    constructor() {
        this.#board = new Board();
        this.#round = 1;
        this.#turn = -1;
        WorldGenerator.generateCircle(this.#board, 0, 0, 5);
    }

    getNextTurn() {
        this.#turn++;
        if (this.#turn === Object.keys(this.#player).length) {
            this.#round++;
            this.#turn = 0;
        }
        return Object.keys(this.#player)[this.#turn];
    }

    distributeResources() {
        for (let b in this.#buildings) {
            let coords = this.#buildings[b].coords;
            let player = this.#buildings[b].player;

            let r = new Resources(0, 0, 0);
            let amount = this.#buildings[b].type === BUILDING_TYPES.CITY ? 2 : 1;

            for (let c in coords) {
                switch (this.#board.getTile(coords[c][0], coords[c][1]).type) {
                    case TILE_TYPES.TREES:
                        r.wood++;
                        break;
                    case TILE_TYPES.MOUNTAIN:
                        r.stone++;
                        break;
                    case TILE_TYPES.CROPS:
                        r.crops++;
                        break;
                    case TILE_TYPES.GRASS:
                        r.wool++;
                }
            }

            this.#resources[player].wood += r.wood * amount;
            this.#resources[player].stone += r.stone * amount;
            this.#resources[player].wool += r.wool * amount;
            this.#resources[player].crops += r.crops * amount;
        }
        return this.#resources;
    }

    getResources() {
        return this.#resources;
    }

    getRound() {
        return this.#round;
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
            if (c == coords) {
                return "blocked";
            }
        }
        let r = this.#resources[player];
        let costs;
        switch (type) {
            case BUILDING_TYPES.HOUSE:
                costs = BUILDING_COSTS.HOUSE;
                break;
            case BUILDING_TYPES.CITY:
                costs = BUILDING_COSTS.CITY;
                break;
            default:
                return false;
        }
        if(!this.#checkCosts(r,costs))  return "resources";
        r.stone -= costs.stone;
        r.wood -= costs.wood;
        r.wool -= costs.wool;
        r.crops -= costs.crops;
        this.#buildings.push(new Building(player, type, x1, y1, x2, y2, x3, y3));
        return true;
    }

    addConnection(player, type, x1, y1, x2, y2) {
        let coords = JSON.stringify([[x1, y1], [x2, y2]].sort(Board.compareCoords));
        for (let con in this.#connections) {
            let c = JSON.stringify(this.#connections[con].coords);
            if (c == coords) {
                return "blocked";
            }
        }
        let r = this.#resources[player];
        let costs;
        switch (type) {
            case CONNECTION_TYPES.STREET:
                costs = CONNECTION_COSTS.STREET;
                break;
            case CONNECTION_TYPES.SHIP:
                costs = CONNECTION_COSTS.SHIP;
                break;
            default:
                return false;
        }
        if(!this.#checkCosts(r,costs)) return "resources";
        r.stone -= costs.stone;
        r.wood -= costs.wood;
        r.wool -= costs.wool;
        r.crops -= costs.crops;
        this.#connections.push(new Connection(player, type, x1, y1, x2, y2));
        return true;
    }

    #checkCosts(r, costs) {
        return r.stone - costs.stone < 0 || r.wood - costs.wood < 0 || r.wool - costs.wool < 0 || r.crops - costs.crops < 0;
    }

    addPlayer(id, name) {
        this.#player[id] = name;
        this.#ready[id] = false;
        this.#resources[id] = new Resources(0, 0, 0);
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
            if (!this.#ready[r]) {
                return false;
            }
        }
        return true;
    }
}
