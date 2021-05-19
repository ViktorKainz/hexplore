import {Tile, TILE_TYPES} from "../public/js/game/tile.js";
import {NEIGHBOURS} from "../public/js/game/board.js";

/**
 * Class that generates the tiles for the board
 */
export class WorldGenerator {

    /**
     * Generates a new tile on the specified coordinates if it is undefined
     * @param {Board} board
     * @param {int} x
     * @param {int} y
     */
    static generate(board, x, y) {
        if (typeof board.getTile(x, y) == "undefined") {
            let tiles = [];
            board.getNeighbours(x, y).forEach((s) => {
                if (typeof s != "undefined") {
                    tiles.push(s.type);
                }
            });

            for (let i in TILE_TYPES) {
                tiles.push(TILE_TYPES[i]);
            }

            board.setTile(x, y, new Tile(tiles[Math.floor(Math.random() * tiles.length)]));
        }
    }

    /**
     * Generates a circle around the specified coordinates with the radius r
     * @param {Board} board
     * @param {int} x
     * @param {int} y
     * @param {int} r
     */
    static generateCircle(board, x, y, r) {
        this.generate(board, x, y);
        for (let i = 1; i <= r; i++) {
            this.generateRing(board,x,y,i);
        }
    }

    /**
     * Generates a ring around the specified coordinates with the radius r
     * @param {Board} board
     * @param {int} x
     * @param {int} y
     * @param {int} r
     */
    static generateRing(board, x, y, r) {
        let active = [x, y];
        for(let i = 0; i < r; i++) {
            active = [active[0]+NEIGHBOURS.RIGHT[0],active[1]+NEIGHBOURS.RIGHT[1]];
        }
        for(let n in NEIGHBOURS) {
            for(let i = 0; i < r; i++) {
                active = [active[0]+NEIGHBOURS[n][0],active[1]+NEIGHBOURS[n][1]];
                this.generate(board,active[0],active[1]);
            }
        }
    }
}
