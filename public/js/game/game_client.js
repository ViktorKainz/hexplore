import {Board} from "./board.js";
import {DrawBoard} from "../draw_board.js";

export class GameClient {
    #board;

    constructor() {
        this.#board = new Board();
        window.socket.createRoom();
        window.addEventListener("load", (e) => {
            this.draw = new DrawBoard();
            this.drawBoard();
        });
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

    drawBoard() {
        this.draw.drawAssets(this.#board);
        console.log("Hi from drawBoard");
    }
}
