const DIRECTIONS = {
    NORTH_EAST: 0,
    SOUTH_EAST: 1,
    SOUTH_WEST: 2,
    NORTH_WEST: 3
}

export const NEIGHBOURS = {
    BOT_LEFT: [-1, +1],
    LEFT: [-1, 0],
    TOP_LEFT: [0, -1],
    TOP_RIGHT: [+1, -1],
    RIGHT: [+1, 0],
    BOT_RIGHT: [0, +1],
}

export class Board {

    constructor() {
        this.map = [[], [], [], []];
    }

    getTile(x, y) {
        return x >= 0 && y >= 0 ? typeof this.map[DIRECTIONS.NORTH_EAST][x] != "undefined" ? this.map[DIRECTIONS.NORTH_EAST][x][y] : undefined :
            x >= 0 && y < 0 ? typeof this.map[DIRECTIONS.SOUTH_EAST][x] != "undefined" ? this.map[DIRECTIONS.SOUTH_EAST][x][y * (-1) - 1] : undefined :
                x < 0 && y >= 0 ? typeof this.map[DIRECTIONS.NORTH_WEST][x * (-1) - 1] != "undefined" ? this.map[DIRECTIONS.NORTH_WEST][x * (-1) - 1][y] : undefined :
                    typeof this.map[DIRECTIONS.SOUTH_WEST][x * (-1) - 1] != "undefined" ? this.map[DIRECTIONS.SOUTH_WEST][x * (-1) - 1][y * (-1) - 1] : undefined;
    }

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

    getMaxX() {
        return (this.map[DIRECTIONS.NORTH_EAST].length >
        this.map[DIRECTIONS.SOUTH_EAST].length ?
            this.map[DIRECTIONS.NORTH_EAST].length :
            this.map[DIRECTIONS.SOUTH_EAST].length);
    }

    getMinX() {
        return (this.map[DIRECTIONS.NORTH_WEST].length >
        this.map[DIRECTIONS.SOUTH_WEST].length ?
            this.map[DIRECTIONS.NORTH_WEST].length :
            this.map[DIRECTIONS.SOUTH_WEST].length) * -1;
    }

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

    getNeighbours(x, y) {
        let results = [];
        for (let i in NEIGHBOURS) {
            results.push(this.getTile(x + NEIGHBOURS[i][0], y + NEIGHBOURS[i][1]));
        }
        return results;
    }

    static compareCoords(a, b) {
        return a[0] - b[0] == 0 ? a[1] - b[1] : a[0] - b[0];
    }
}

