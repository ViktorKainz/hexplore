const direction = {
    NORTH_EAST: 0,
    SOUTH_EAST: 1,
    SOUTH_WEST: 2,
    NORTH_WEST: 3
}

export class Board {

    constructor() {
        this.map = [[], [], [], []];
    }

    getTile(x, y) {
        if (x >= 0 && y >= 0) {
            return this.map[direction.NORTH_EAST][x][y];
        } else if (x >= 0 && y < 0) {
            return this.map[direction.SOUTH_EAST][x][y * (-1) - 1];
        } else if (x < 0 && y >= 0) {
            return this.map[direction.NORTH_WEST][x * (-1) - 1][y];
        } else {
            return this.map[direction.SOUTH_WEST][x * (-1) - 1][y * (-1) - 1];
        }
    }

    setTile(x, y, tile) {
        let d;
        if (x >= 0 && y >= 0) {
            d = direction.NORTH_EAST;
        } else if (x >= 0 && y < 0) {
            d = direction.SOUTH_EAST;
            y = y * (-1) - 1;
        } else if (x < 0 && y >= 0) {
            d = direction.NORTH_WEST;
            x = x * (-1) - 1;
        } else {
            d = direction.SOUTH_WEST;
            x = x * (-1) - 1;
            y = y * (-1) - 1;
        }
        if(typeof this.map[d][x] == "undefined") {
            this.map[d][x] = [];
        }
        this.map[d][x][y] = tile;
        console.log(this.map);
    }
}

