import {Board} from "./board.js";

export class GameClient {
    #board;

    constructor(socket) {
        this.#board = new Board();
    }

    getTile(x, y) {
        if (typeof this.#board.getTile(x, y) == "undefined") {
            socket.getTile(x, y);
            return undefined;
        }
        return this.#board.getTile(x, y);
    }

    setTile(x, y, tile) {
        this.#board.setTile(x, y, tile);
    }

    setBoard(board) {
        this.#board = board;
    }
}
