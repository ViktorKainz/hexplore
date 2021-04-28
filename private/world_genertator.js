import {Tile, TILE_TYPES} from "../public/js/game/tile.js";
import {NEIGHBOURS} from "../public/js/game/board.js";

export class WorldGenerator {

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

    static generateCircle(board, x, y, r) {
        this.generate(board, x, y);
        for (let i = 1; i <= r; i++) {
            this.generateRing(board,x,y,i);
        }
    }

    static generateRing(board, x, y, r) {
        let active = [x, y];
        for(let i = 0; i < r; i++) {
            let index = Math.abs(active[1])%2;
            active = [active[0]+NEIGHBOURS.RIGHT[index][0],active[1]+NEIGHBOURS.RIGHT[index][1]];
        }
        for(let n in NEIGHBOURS) {
            for(let i = 0; i < r; i++) {
                let index = Math.abs(active[1])%2;
                active = [active[0]+NEIGHBOURS[n][index][0],active[1]+NEIGHBOURS[n][index][1]];
                this.generate(board,active[0],active[1]);
            }
        }
    }
}
