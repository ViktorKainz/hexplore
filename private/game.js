import {Board} from "../public/js/game/board.js";
import {Tile, TILE_TYPES} from "../public/js/game/tile.js";
import {WorldGenerator} from "./world_genertator.js";

export class Game {

    constructor() {
        this.board = new Board();
        WorldGenerator.generateCircle(this.board,0,0,5);
        let out = "";
        for(let y = this.board.getMinY(); y <= this.board.getMaxY(); y++) {
            for(let x = this.board.getMinX(); x <= this.board.getMaxX(); x++) {
                let t = this.board.getTile(x,y);
                out += typeof t != "undefined" ? t.type.charAt(0) : "o";
            }
            out += "\n";
        }
        console.log(out);

    }
}
