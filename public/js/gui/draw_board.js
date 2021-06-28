import {Tile, TILE_TYPES} from "../game/tile.js";
import {HexPosition} from "./hexposition.js";
import {NEIGHBOURS} from "../game/board.js";
import {Hex} from "../gui/hex.js";
import {Point} from "../gui/point.js";
import {CanvasInteractions} from "./canvas_interactions.js";

/**
 * Class that handles drawing on the canvas
 * @author Koloman Moser
 */
export class DrawBoard {

    constructor() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.shadow = document.getElementById("shadow").getContext('2d');
        this.background = document.getElementById("background").getContext('2d');
        this.size = 40;
        this.xOffset = 0;
        this.yOffset = 0;
        this.xWind = (Math.floor(Math.random() * 10) - 5) / 10;
        this.yWind = (Math.floor(Math.random() * 10) - 5) / 10;
        this.xWindOffset = 0;
        this.yWindOffset = 0;
        this.hexcenters = [];

        let img = new Image();
        img.src = "../assets/Clouds.jpg";
        img.onload = function () {
            let d = gameClient.draw;
            d.clouds = d.ctx.createPattern(img, "repeat");
            d.background.fillStyle = d.clouds;
        }

        this.resize();
    }

    /**
     * handles the resize event and adjusts the sizes accordingly
     */
    resize() {
        this.hexOrigin = {x: this.canvas.width / 2, y: this.canvas.height / 2};

        this.hexHeight = this.size * 2;
        this.hexWidth = Math.sqrt(3) * this.size;
        this.vertDist = this.hexHeight * 3 / 4;

        this.background.fillStyle = this.clouds;
    }

    /**
     * draws a building on a corner point
     * @param {Building[]} buildings
     */
    drawBuilding(buildings) {
        for (let b in buildings) {
            let building = buildings[b];
            let x = 0;
            let y = 0;
            for (let i = 0; i < building.coords.length; i++) {
                let q = building.coords[i][0];
                let r = building.coords[i][1];
                let hex = {q, r};
                let point = CanvasInteractions.hexToPixel(hex);
                x += point.x;
                y += point.y;
            }
            x /= building.coords.length;
            y /= building.coords.length;
            this.ctx.drawImage(gameClient.getPlayerAssets(building.player)[building.type], x - this.hexWidth / 8, y - this.hexHeight / 8, this.hexWidth / 4, this.hexHeight / 4);
        }
    }

    /**
     * draws a connection between two corner points
     * @param {Connection[]} connections
     */
    drawConnection(connections) {
        for (let c in connections) {
            let connection = connections[c];
            let hexCorner = [];
            for (let i = 0; i < connection.coords.length; i++) {
                let q = connection.coords[i][0];
                let r = connection.coords[i][1];
                let hex = {q, r};
                let center = CanvasInteractions.hexToPixel(hex);
                for (let i = 0; i <= 5; i++) {
                    let corner = CanvasInteractions.hexCorner(center, i);
                    hexCorner.push(corner);
                }
            }
            let duplicates = CanvasInteractions.checkDuplicates(hexCorner);

            this.ctx.lineWidth = 5;
            this.drawLine(duplicates.pop(), duplicates.pop(), gameClient.getColors()[connection.player]);
            this.ctx.lineWidth = 1;
        }
    }

    /**
     * draws a single hexagon using it's center
     * @param {Point} center
     */
    drawHex(center) {
        for (let i = 0; i <= 5; i++) {
            let start = CanvasInteractions.hexCorner(center, i);
            let end = CanvasInteractions.hexCorner(center, i + 1);
            this.drawLine({x: start.x, y: start.y}, {x: end.x, y: end.y});
        }
    }

    /**
     * draws a line between two points
     * @param {Point} start
     * @param {Point} end
     * @param {string} [color="#000000"]
     */
    drawLine(start, end, color = "#000000") {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * draws coordinates on a hexagon
     * @param {Point} center
     * @param {Hex} hex
     */
    drawHexCoordinates(center, hex) {
        this.ctx.fillText(hex.q, center.x - 7, center.y + 2);
        this.ctx.fillText(hex.r, center.x - 1, center.y + 2);
    }

    /**
     * draws the background
     */
    drawBackground() {
        this.background.translate(this.xOffset * 0.5 + this.xWindOffset, this.yOffset * 0.5 + this.yWindOffset);
        this.background.fillRect(-this.xOffset * 0.5 - this.xWindOffset, -this.yOffset * 0.5 - this.yWindOffset, this.canvas.width, this.canvas.height);
        this.background.translate(-this.xOffset * 0.5 - this.xWindOffset, -this.yOffset * 0.5 - this.yWindOffset);
        this.xWindOffset += this.xWind;
        this.yWindOffset += this.yWind;
    }

    /**
     * draws the tiles on the canvas
     * @param {Board} board
     */
    drawTiles(board) {
        this.hexcenters = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.shadow.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = board.getMinY(); y <= board.getMaxY(); y++) {
            for (let x = board.getMinX(); x <= board.getMaxX(); x++) {
                let tile = board.getTile(x, y);
                if (typeof tile != "undefined" && tile != null) {
                    let center = CanvasInteractions.hexToPixel(new Hex(x, y));
                    if (center.x >= -this.size && center.y >= -this.size && center.x <= this.canvas.width + this.size && center.y <= this.canvas.height + this.size) {
                        let botLeft = board.getTile(x + NEIGHBOURS.BOT_LEFT[0], y + NEIGHBOURS.BOT_LEFT[1]);
                        let botRight = board.getTile(x + NEIGHBOURS.BOT_RIGHT[0], y + NEIGHBOURS.BOT_RIGHT[1]);
                        if ((tile.type === TILE_TYPES.GRASS || tile.type === TILE_TYPES.DESERT || tile.type === TILE_TYPES.WATER) &&
                            (typeof botLeft == "undefined" || botLeft == null || typeof botRight == "undefined" || botRight == null)) {
                            this.ctx.drawImage(gameClient.assets.get(tile.type + "_Border"), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight * 1.23);
                        } else {
                            if (typeof Tile.getBackground(tile.type) != "undefined") {
                                let background = Tile.getBackground(tile.type);
                                if ((background === TILE_TYPES.GRASS || background === TILE_TYPES.DESERT || background === TILE_TYPES.WATER) &&
                                    (typeof botLeft == "undefined" || botLeft == null || typeof botRight == "undefined" || botRight == null)) {
                                    this.ctx.drawImage(gameClient.assets.get(background + "_Border"), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight * 1.23);
                                } else {
                                    this.ctx.drawImage(gameClient.assets.get(Tile.getBackground(tile.type)), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);
                                }
                            }
                            this.ctx.drawImage(gameClient.assets.get(tile.type), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);
                        }

                        this.hexcenters.push(new HexPosition(center, x, y));
                        this.drawHex(center);
                        //this.drawHexCoordinates(center, new Hex(x, y));
                    }
                    let shadow = CanvasInteractions.hexToPixel(new Hex(x + NEIGHBOURS.BOT_RIGHT[0] * 2, y + NEIGHBOURS.BOT_RIGHT[1] * 2));
                    if (shadow.x >= -this.size && shadow.y >= -this.size && shadow.x <= this.canvas.width + this.size && shadow.y <= this.canvas.height + this.size) {
                        this.shadow.drawImage(gameClient.assets.get("shadow"), shadow.x, shadow.y - (this.hexHeight / 2), this.hexWidth + 2, this.hexHeight + 2);
                    }
                }
            }
        }
    }
}
