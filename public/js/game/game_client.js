import {Board} from "./board.js";
import {DrawBoard} from "../utility/draw_board.js";
import {Assets} from "../utility/assets.js";

export class GameClient {
    #board;

    constructor() {
        this.#board = new Board();
        window.socket.createRoom();
        this.assets = new Assets();
        this.assets.addEventListener("loaded", (e) => {
            this.draw = new DrawBoard();
            window.socket.getBoard();
        });
        this.assets.load();
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
        this.#board.map = board;
        console.log(board);
        this.drawBoard();
    }

    drawBoard() {
        this.draw.drawAssets(this.#board, this.assets);
    }
}
