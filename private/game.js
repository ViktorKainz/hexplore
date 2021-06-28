import {Board, NEIGHBOURS} from "../public/js/game/board.js";
import {WorldGenerator} from "./world_genertator.js";
import {Building, BUILDING_COSTS, BUILDING_TYPES} from "../public/js/game/building.js";
import {Connection, CONNECTION_COSTS, CONNECTION_TYPES} from "../public/js/game/connection.js";
import {Resources} from "../public/js/game/resources.js";
import {TILE_TYPES} from "../public/js/game/tile.js";

const PLAYER_COLORS = [
    "#0000FF",
    "#008000",
    "#FF0000",
    "#FFFF00",
    "#8B4513",
    "#800080"
]

/**
 * Class that handles a running game session
 * @author Viktor Kainz
 */
export class Game {

    #board;
    #buildings = [];
    #connections = [];
    #player = {};
    #ready = {};
    #resources = {};
    #points = {};
    #colors = {};
    #round;
    #turn;
    #multiplier;
    #pointstowin = 20;

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
        this.#multiplier = new Resources(
            ((Math.floor(Math.random() * 15)) + 5) / 10,
            ((Math.floor(Math.random() * 15)) + 5) / 10,
            ((Math.floor(Math.random() * 15)) + 5) / 10,
            ((Math.floor(Math.random() * 15)) + 5) / 10
        );
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

            let r = new Resources(0, 0, 0, 0);
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
            this.#resources[player].wood += Math.round(r.wood * amount * this.#multiplier.wood);
            this.#resources[player].stone += Math.round(r.stone * amount * this.#multiplier.stone);
            this.#resources[player].wool += Math.round(r.wool * amount * this.#multiplier.wool);
            this.#resources[player].crops += Math.round(r.crops * amount * this.#multiplier.crops);
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
        let build = 0;
        let house = false;

        let costs;
        if (type === BUILDING_TYPES.HOUSE) {
            for (let b in this.#buildings) {
                let c = JSON.stringify(this.#buildings[b].coords);
                if (c === coords) {
                    return "blocked";
                }
                if (this.#buildings[b].player === player) {
                    build++;
                }
            }
            let neighbourConnections = [
                [[x1, y1], [x2, y2]],
                [[x1, y1], [x3, y3]],
                [[x2, y2], [x3, y3]]
            ];
            if (build > 1 && !this.hasNeighbour(neighbourConnections, this.#connections, player)) {
                return "no neighbours";
            }
            costs = BUILDING_COSTS.HOUSE;
        } else if (type === BUILDING_TYPES.CITY) {
            for (let b in this.#buildings) {
                let c = JSON.stringify(this.#buildings[b].coords);
                if (c === coords && this.#buildings[b].type === BUILDING_TYPES.HOUSE) {
                    house = this.#buildings[b];
                }
            }
            if (!house) {
                return "no house";
            }
            costs = BUILDING_COSTS.CITY;
        } else {
            return false;
        }

        if (!(build < 2 && type === BUILDING_TYPES.HOUSE)) {
            let r = this.#resources[player];
            if (!Game.checkCosts(r, costs)) return "resources";
            r.stone -= costs.stone;
            r.wood -= costs.wood;
            r.wool -= costs.wool;
            r.crops -= costs.crops;
        }

        if (type === BUILDING_TYPES.CITY) {
            this.#buildings = this.#buildings.filter(value => value !== house);
        }

        this.#buildings.push(new Building(player, type, x1, y1, x2, y2, x3, y3));
        this.#points[player]++;
        let c = [[x1, y1], [x2, y2], [x3, y3]];
        for (let i in c) {
            WorldGenerator.generateCircle(this.#board, c[i][0], c[i][1], 1);
        }
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
        let neighbours = [];
        switch (JSON.stringify([x2 - x1, y2 - y1])) {
            case JSON.stringify(NEIGHBOURS.BOT_RIGHT):
                neighbours[0] = [x1 + NEIGHBOURS.RIGHT[0], y1 + NEIGHBOURS.RIGHT[1]];
                neighbours[1] = [x1 + NEIGHBOURS.BOT_LEFT[0], y1 + NEIGHBOURS.BOT_LEFT[1]];
                break;
            case JSON.stringify(NEIGHBOURS.TOP_RIGHT):
                neighbours[0] = [x1 + NEIGHBOURS.RIGHT[0], y1 + NEIGHBOURS.RIGHT[1]];
                neighbours[1] = [x1 + NEIGHBOURS.TOP_LEFT[0], y1 + NEIGHBOURS.TOP_LEFT[1]];
                break;
            case JSON.stringify(NEIGHBOURS.BOT_LEFT):
                neighbours[0] = [x1 + NEIGHBOURS.LEFT[0], y1 + NEIGHBOURS.LEFT[1]];
                neighbours[1] = [x1 + NEIGHBOURS.BOT_RIGHT[0], y1 + NEIGHBOURS.BOT_RIGHT[1]];
                break;
            case JSON.stringify(NEIGHBOURS.TOP_LEFT):
                neighbours[0] = [x1 + NEIGHBOURS.LEFT[0], y1 + NEIGHBOURS.LEFT[1]];
                neighbours[1] = [x1 + NEIGHBOURS.TOP_RIGHT[0], y1 + NEIGHBOURS.TOP_RIGHT[1]];
                break;
            case JSON.stringify(NEIGHBOURS.RIGHT):
                neighbours[0] = [x1 + NEIGHBOURS.TOP_RIGHT[0], y1 + NEIGHBOURS.TOP_RIGHT[1]];
                neighbours[1] = [x1 + NEIGHBOURS.BOT_RIGHT[0], y1 + NEIGHBOURS.BOT_RIGHT[1]];
                break;
            case JSON.stringify(NEIGHBOURS.LEFT):
                neighbours[0] = [x1 + NEIGHBOURS.TOP_LEFT[0], y1 + NEIGHBOURS.TOP_LEFT[1]];
                neighbours[1] = [x1 + NEIGHBOURS.BOT_LEFT[0], y1 + NEIGHBOURS.BOT_LEFT[1]];
                break;
        }
        let neighbourConnections = [
            [[x1, y1], neighbours[0]].sort(Board.compareCoords),
            [[x1, y1], neighbours[1]].sort(Board.compareCoords),
            [[x2, y2], neighbours[0]].sort(Board.compareCoords),
            [[x2, y2], neighbours[1]].sort(Board.compareCoords)
        ];
        if (!this.hasNeighbour(neighbourConnections, this.#connections, player)) {
            let neighbourBuildings = [
                [[x1, y1], [x2, y2], neighbours[0]].sort(Board.compareCoords),
                [[x1, y1], [x2, y2], neighbours[1]].sort(Board.compareCoords)
            ];
            if (!this.hasNeighbour(neighbourBuildings, this.#buildings, player)) {
                return "no neighbours";
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
        if (!Game.checkCosts(r, costs)) return "resources";
        r.stone -= costs.stone;
        r.wood -= costs.wood;
        r.wool -= costs.wool;
        r.crops -= costs.crops;
        this.#connections.push(new Connection(player, type, x1, y1, x2, y2));
        let c = [[x1, y1], [x2, y2]];
        for (let i in c) {
            WorldGenerator.generateCircle(this.#board, c[i][0], c[i][1], 1);
        }
        return true;
    }

    /**
     * Returns true if one of the neighbours is a building or connection of the player
     * @param {int[][][]} neighbours Array of coordinates of possible neighbours
     * @param {Building[]|Connection[]} all Array of all buildings or connections
     * @param {int} player
     * @returns {boolean}
     */
    hasNeighbour(neighbours, all, player) {
        for (let n in neighbours) {
            let coords = JSON.stringify(neighbours[n].sort(Board.compareCoords));
            for (let a in all) {
                let c = JSON.stringify(all[a].coords);
                if (c === coords && all[a].player === player) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if there are enough resources
     * @param {Resources} r Resources
     * @param {Resources} c Costs
     * @returns {boolean}
     */
    static checkCosts(r, c) {
        return r.stone - c.stone >= 0 && r.wood - c.wood >= 0 && r.wool - c.wool >= 0 && r.crops - c.crops >= 0;
    }

    /**
     * Exchanges 4 resources of a player into another
     * @param {int} player
     * @param {Resources} input
     * @param {Resources} output
     * @returns {boolean}
     */
    exchangeResources(player, input, output) {
        if (!Game.checkCosts(this.#resources[player], input)) return false;
        let inAmount = 0;
        let outAmount = 0;
        let inEmpty = 0;
        let outEmpty = 0;
        for (let value of Object.values(input)) {
            inAmount += parseInt(value);
            if (value == 0) {
                inEmpty++;
            }
        }
        for (let value of Object.values(output)) {
            outAmount += parseInt(value);
            if (value == 0) {
                outEmpty++;
            }
        }
        if (inEmpty !== 3 && outEmpty !== 3 && inAmount / 4 !== outAmount) return false;
        this.removeResourcesFromPlayer(player, input);
        this.addResourcesToPlayer(player, output);
        return true;
    }

    /**
     * Removes the specified resources from the player
     * @param {int} player
     * @param {Resources} resources
     */
    removeResourcesFromPlayer(player, resources) {
        this.#resources[player].wood -= parseInt(resources.wood);
        this.#resources[player].wool -= parseInt(resources.wool);
        this.#resources[player].crops -= parseInt(resources.crops);
        this.#resources[player].stone -= parseInt(resources.stone);
    }

    /**
     * Adds the specified resources to the player
     * @param {int} player
     * @param {Resources} resources
     */
    addResourcesToPlayer(player, resources) {
        this.#resources[player].wood += parseInt(resources.wood);
        this.#resources[player].wool += parseInt(resources.wool);
        this.#resources[player].crops += parseInt(resources.crops);
        this.#resources[player].stone += parseInt(resources.stone);
    }

    /**
     * Registers a player in the current game
     * @param {int} id
     * @param {string} name
     */
    addPlayer(id, name) {
        this.#player[id] = name;
        this.#ready[id] = false;
        this.#resources[id] = new Resources(0, 0, 0, 0);
        this.#points[id] = 0;
        this.#colors[id] = PLAYER_COLORS[Object.keys(this.#player).length - 1];
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

    /**
     * Returns true if the game has started
     * @returns {boolean}
     */
    hasStarted() {
        return this.#turn >= 0;
    }

    /**
     * Returns the points of all player
     * @returns {{}}
     */
    getPoints() {
        return this.#points;
    }

    /**
     * Returns the colors of all player
     * @returns {{}}
     */
    getColors() {
        return this.#colors;
    }

    /**
     * Returns true if the game has a winner
     * @returns {boolean}
     */
    hasWinner() {
        for (let i in this.#points) {
            if (this.#points[i] >= this.#pointstowin) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the id of the player that has won
     * @returns {string}
     */
    getWinner() {
        for (let i in this.#points) {
            if (this.#points[i] >= this.#pointstowin) {
                return i;
            }
        }
    }
}
