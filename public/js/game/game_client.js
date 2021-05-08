import {Board} from "./board.js";
import {DrawBoard} from "../utility/draw_board.js";
import {Assets} from "../utility/assets.js";

export class GameClient {
    #board;

    constructor() {
        this.#board = new Board();
        this.assets = new Assets();
        this.assets.addEventListener("loaded", (e) => {
            this.draw = new DrawBoard();
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

    resize() {
        this.draw.resize();
    }

    keyHandler(e) {
        switch (e.key) {
            case "w": window.gameClient.draw.yOffset+=5; break;
            case "s": window.gameClient.draw.yOffset-=5; break;
            case "a": window.gameClient.draw.xOffset+=5; break;
            case "d": window.gameClient.draw.xOffset-=5; break;
            case "c": window.gameClient.draw.yOffset=0;
                      window.gameClient.draw.xOffset=0; break;
        }
    }
}
