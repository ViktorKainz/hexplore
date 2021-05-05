import {Board} from "../public/js/game/board.js";
import {WorldGenerator} from "./world_genertator.js";

export class Game {

    #board;

    constructor() {
        this.#board = new Board();
        WorldGenerator.generateCircle(this.#board,0,0,5);
    }

    getTile(x, y) {
        WorldGenerator.generate(this.#board, x, y);
        return this.#board.getTile(x,y);
    }

    getBoard() {
        return this.#board;
    }
}
