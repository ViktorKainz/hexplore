import {Board} from "../public/js/game/board.js";
import {WorldGenerator} from "./world_genertator.js";

export class Game {

    #board;

    constructor() {
        this.#board = new Board();
        WorldGenerator.generateCircle(this.#board,0,0,1000);
        let out = "";
        for(let y = this.#board.getMinY(); y <= this.#board.getMaxY(); y++) {
            for(let x = this.#board.getMinX(); x <= this.#board.getMaxX(); x++) {
                let t = this.#board.getTile(x,y);
                out += typeof t != "undefined" ? t.type.charAt(0) : "o";
            }
            out += "\n";
        }
        console.log(out);
    }

    getTile(x, y) {
        WorldGenerator.generate(this.#board, x, y);
        return this.#board.getTile(x,y);
    }

    getBoard() {
        return this.#board;
    }
}
