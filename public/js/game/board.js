/**
 * Constant that stores the cardinal points
 * @type {{NORTH_WEST: int, NORTH_EAST: int, SOUTH_EAST: int, SOUTH_WEST: int}}
 */
const DIRECTIONS = {
    NORTH_EAST: 0,
    SOUTH_EAST: 1,
    SOUTH_WEST: 2,
    NORTH_WEST: 3
}

/**
 * Constant that stores the directions to get to the neighbours of a tile
 * @type {{BOT_LEFT: int[], TOP_LEFT: int[], LEFT: int[], TOP_RIGHT: int[], RIGHT: int[], BOT_RIGHT: int[]}}
 */
export const NEIGHBOURS = {
    BOT_LEFT: [-1, +1],
    LEFT: [-1, 0],
    TOP_LEFT: [0, -1],
    TOP_RIGHT: [+1, -1],
    RIGHT: [+1, 0],
    BOT_RIGHT: [0, +1],
}

/**
 * Class that stores the locations of every tile
 */
export class Board {

    constructor() {
        this.map = [[], [], [], []];
    }

    /**
     * Returns the Tile on the specified coordinates
     * @param {int} x
     * @param {int} y
     * @returns {Tile|undefined}
     */
    getTile(x, y) {
        return x >= 0 && y >= 0 ? typeof this.map[DIRECTIONS.NORTH_EAST][x] != "undefined" ? this.map[DIRECTIONS.NORTH_EAST][x][y] : undefined :
            x >= 0 && y < 0 ? typeof this.map[DIRECTIONS.SOUTH_EAST][x] != "undefined" ? this.map[DIRECTIONS.SOUTH_EAST][x][y * (-1) - 1] : undefined :
                x < 0 && y >= 0 ? typeof this.map[DIRECTIONS.NORTH_WEST][x * (-1) - 1] != "undefined" ? this.map[DIRECTIONS.NORTH_WEST][x * (-1) - 1][y] : undefined :
                    typeof this.map[DIRECTIONS.SOUTH_WEST][x * (-1) - 1] != "undefined" ? this.map[DIRECTIONS.SOUTH_WEST][x * (-1) - 1][y * (-1) - 1] : undefined;
    }

    /**
     * Sets the Tile on the specified coordinates
     * @param {int} x
     * @param {int} y
     * @param {Tile} tile
     */
    setTile(x, y, tile) {
        let d;
        if (x >= 0 && y >= 0) {
            d = DIRECTIONS.NORTH_EAST;
        } else if (x >= 0 && y < 0) {
            d = DIRECTIONS.SOUTH_EAST;
            y = y * (-1) - 1;
        } else if (x < 0 && y >= 0) {
            d = DIRECTIONS.NORTH_WEST;
            x = x * (-1) - 1;
        } else {
            d = DIRECTIONS.SOUTH_WEST;
            x = x * (-1) - 1;
            y = y * (-1) - 1;
        }
        if (typeof this.map[d][x] == "undefined") {
            this.map[d][x] = [];
        }
        this.map[d][x][y] = tile;
    }

    /**
     * Returns the highest x coordinate
     * @returns {int} maximal X
     */
    getMaxX() {
        return (this.map[DIRECTIONS.NORTH_EAST].length >
        this.map[DIRECTIONS.SOUTH_EAST].length ?
            this.map[DIRECTIONS.NORTH_EAST].length :
            this.map[DIRECTIONS.SOUTH_EAST].length);
    }

    /**
     * Returns the lowest x coordinate
     * @returns {int} minimal X
     */
    getMinX() {
        return (this.map[DIRECTIONS.NORTH_WEST].length >
        this.map[DIRECTIONS.SOUTH_WEST].length ?
            this.map[DIRECTIONS.NORTH_WEST].length :
            this.map[DIRECTIONS.SOUTH_WEST].length) * -1;
    }

    /**
     * Returns the highest y coordinate
     * @returns {int} maximal Y
     */
    getMaxY() {
        let max = 0;
        for (let i = 0; i < this.map[DIRECTIONS.NORTH_EAST].length; i++) {
            if (this.map[DIRECTIONS.NORTH_EAST][i].length > max) {
                max = this.map[DIRECTIONS.NORTH_EAST][i].length;
            }
        }
        for (let i = 0; i < this.map[DIRECTIONS.NORTH_WEST].length; i++) {
            if (this.map[DIRECTIONS.NORTH_WEST][i].length > max) {
                max = this.map[DIRECTIONS.NORTH_WEST][i].length;
            }
        }
        return max;
    }

    /**
     * Returns the lowest y coordinate
     * @returns {int} minimal Y
     */
    getMinY() {
        let max = 0;
        for (let i = 0; i < this.map[DIRECTIONS.SOUTH_EAST].length; i++) {
            if (typeof this.map[DIRECTIONS.SOUTH_EAST][i] != "undefined" &&
                this.map[DIRECTIONS.SOUTH_EAST][i].length > max) {
                max = this.map[DIRECTIONS.SOUTH_EAST][i].length;
            }
        }
        for (let i = 0; i < this.map[DIRECTIONS.SOUTH_WEST].length; i++) {
            if (typeof this.map[DIRECTIONS.SOUTH_WEST][i] != "undefined" &&
                this.map[DIRECTIONS.SOUTH_WEST][i].length > max) {
                max = this.map[DIRECTIONS.SOUTH_WEST][i].length;
            }
        }
        return max * -1;
    }

    /**
     * Returns an array of all tiles that are next to the specified coordinates
     * @param {int} x
     * @param {int} y
     * @returns {Tile[]} Neighbours
     */
    getNeighbours(x, y) {
        let results = [];
        for (let i in NEIGHBOURS) {
            results.push(this.getTile(x + NEIGHBOURS[i][0], y + NEIGHBOURS[i][1]));
        }
        return results;
    }

    /**
     * Compares two coordinates
     * @param a
     * @param b
     * @returns {int}
     */
    static compareCoords(a, b) {
        return a[0] - b[0] === 0 ? a[1] - b[1] : a[0] - b[0];
    }
}

