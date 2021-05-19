import {Board} from "../public/js/game/board.js";
import {WorldGenerator} from "./world_genertator.js";
import {Building, BUILDING_COSTS, BUILDING_TYPES} from "../public/js/game/building.js";
import {Connection, CONNECTION_COSTS, CONNECTION_TYPES} from "../public/js/game/connection.js";
import {Resources} from "../public/js/game/resources.js";
import {TILE_TYPES} from "../public/js/game/tile.js";

/**
 * Class that handles a running game session
 */
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

    /**
     * Starts next turn and returns the player whose turn it is
     * @returns {int} Player ID
     */
    getNextTurn() {
        this.#turn++;
        if (this.#turn === Object.keys(this.#player).length) {
            this.#round++;
            this.#turn = 0;
        }
        return parseInt(Object.keys(this.#player)[this.#turn]);
    }

    /**
     * Distributes resources to the players and returns an object containing them
     * @returns {{}} Resources of player
     */
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

    /**
     * Returns an object containing the player ids and resources
     * @returns {{}} Resources of player
     */
    getResources() {
        return this.#resources;
    }

    /**
     * Returns the current round
     * @returns {int} Round
     */
    getRound() {
        return this.#round;
    }

    /**
     * Returns the Tile on the specified coordinates.
     * If it does not exist a new one is generated.
     * @param {int} x
     * @param {int} y
     * @returns {Tile}
     */
    getTile(x, y) {
        WorldGenerator.generate(this.#board, x, y);
        return this.#board.getTile(x, y);
    }

    /**
     * Returns the board of the current game
     * @returns {Board}
     */
    getBoard() {
        return this.#board;
    }

    /**
     * Adds the specified building on the specified coordinates.
     * If it is successful it returns true else it returns false or an error code.
     * @param {int} player
     * @param {string} type
     * @param {int} x1
     * @param {int} y1
     * @param {int} x2
     * @param {int} y2
     * @param {int} x3
     * @param {int} y3
     * @returns {string|boolean}
     */
    addBuilding(player, type, x1, y1, x2, y2, x3, y3) {
        let coords = JSON.stringify([[x1, y1], [x2, y2], [x3, y3]].sort(Board.compareCoords));
        for (let b in this.#buildings) {
            let c = JSON.stringify(this.#buildings[b].coords);
            if (c === coords) {
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
        if(!Game.checkCosts(r,costs))  return "resources";
        r.stone -= costs.stone;
        r.wood -= costs.wood;
        r.wool -= costs.wool;
        r.crops -= costs.crops;
        this.#buildings.push(new Building(player, type, x1, y1, x2, y2, x3, y3));
        return true;
    }

    /**
     * Adds the specified connection on the specified coordinates.
     * If it is successful it returns true else it returns false or an error code.
     * @param {int} player
     * @param {string} type
     * @param {int} x1
     * @param {int} y1
     * @param {int} x2
     * @param {int} y2
     * @returns {string|boolean}
     */
    addConnection(player, type, x1, y1, x2, y2) {
        let coords = JSON.stringify([[x1, y1], [x2, y2]].sort(Board.compareCoords));
        for (let con in this.#connections) {
            let c = JSON.stringify(this.#connections[con].coords);
            if (c === coords) {
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
        if(!Game.checkCosts(r,costs)) return "resources";
        r.stone -= costs.stone;
        r.wood -= costs.wood;
        r.wool -= costs.wool;
        r.crops -= costs.crops;
        this.#connections.push(new Connection(player, type, x1, y1, x2, y2));
        return true;
    }

    /**
     * Checks if there are enough resources
     * @param {Resources} r Resources
     * @param {Resources} c Costs
     * @returns {boolean}
     */
    static checkCosts(r, c) {
        return r.stone - c.stone < 0 || r.wood - c.wood < 0 || r.wool - c.wool < 0 || r.crops - c.crops < 0;
    }

    /**
     * Registers a player in the current game
     * @param {int} id
     * @param {string} name
     */
    addPlayer(id, name) {
        this.#player[id] = name;
        this.#ready[id] = false;
        this.#resources[id] = new Resources(0, 0, 0);
    }

    /**
     * Returns an array with the constructed buildings
     * @returns {Building[]}
     */
    getBuildings() {
        return this.#buildings;
    }

    /**
     * Returns an array with the constructed connections
     * @returns {Connection[]}
     */
    getConnections() {
        return this.#connections;
    }

    /**
     * Returns the registered players in the current game
     * @returns {{}} Names of player
     */
    getPlayer() {
        return this.#player;
    }

    /**
     * Sets the status of the player with the specified id to ready
     * @param {int} id
     */
    setReady(id) {
        this.#ready[id] = true;
    }

    /**
     * Returns the ready status of all player
     * @returns {{}} Status of player
     */
    getReady() {
        return this.#ready;
    }

    /**
     * Returns true if all registered players are ready
     * @returns {boolean}
     */
    isReady() {
        for (let r in this.#ready) {
            if (!this.#ready[r]) {
                return false;
            }
        }
        return true;
    }
}
