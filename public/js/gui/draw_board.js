import {Tile, TILE_TYPES} from "../game/tile.js";
import {HexPosition} from "../game/hexposition.js";
import {NEIGHBOURS} from "../game/board.js";
import {BUILDING_TYPES} from "../game/building.js";
import {CONNECTION_TYPES} from "../game/connection.js";
import {Hex} from "../gui/hex.js";
import {Point} from "../gui/point.js";

/**
 * Class that handles drawing on the canvas
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
     * adds a building or a connection depending on the selected button
     * @param {event} e
     */
    clickevent(e){
        let draw = window.gameClient.draw;
        let data = draw.ctx.getImageData(e.x, e.y,1,1).data;

        if(data[3] !== 0) {
            draw.canvas.removeEventListener("click", draw.clickevent);
            let type = window.buildtype;
            let mouse = new Point(e.x, e.y);
            let hexposition = draw.findHex(mouse);
            let center = hexposition.center;
            let hex = new Hex(hexposition.x,hexposition.y);
            let hexcorner = [];
            let nearestCorner = 0;
            let distances = [];
            let currentCorner = 0;
            let oldDistance = draw.calcDistance(mouse, draw.hex_corner(center, currentCorner));
            let newDistance = oldDistance;

            distances.push({newDistance, currentCorner});
            hexcorner.push(draw.hex_corner(center, currentCorner));

            for (currentCorner = 1; currentCorner <= 5; currentCorner++) {
                let corner = draw.hex_corner(center, currentCorner);
                hexcorner.push(corner);
                newDistance = draw.calcDistance(mouse, corner);
                distances.push({newDistance, currentCorner});
                if(newDistance < oldDistance){
                    nearestCorner = currentCorner;
                    oldDistance = newDistance;
                }
            }

            let neighbors = draw.findNeighbors(hex, nearestCorner);

            if(type === CONNECTION_TYPES.STREET) {
                let distance1 = distances[0].currentCorner !== nearestCorner ? distances[0].newDistance : distances[1].newDistance;
                let distance2;
                let secNearCorner = distances[0].currentCorner !== nearestCorner ? distances[0].currentCorner : distances[1].currentCorner;

                for(let distance in distances) {
                    if (distances[distance].currentCorner !== nearestCorner) {
                        distance2 = distances[distance].newDistance;
                        if (distance1 > distance2) {
                            distance1 = distance2;
                            secNearCorner = distances[distance].currentCorner;
                        }
                    }
                }
                let otherNeighbors = draw.findNeighbors(hex, secNearCorner);

                let streetHex;

                for(let j = 0; j < otherNeighbors.length; j++){
                    for(let l = 0; l < neighbors.length; l++){
                        if(otherNeighbors[j].q === neighbors[l].q && otherNeighbors[j].r === neighbors[l].r){
                            streetHex = neighbors[l];
                        }
                    }
                }
                window.socketClient.addConnection(type, hex.q, hex.r, streetHex.q, streetHex.r);
            }
            else if(type === BUILDING_TYPES.HOUSE || type === BUILDING_TYPES.CITY){
                neighbors.push(hex);
                window.socketClient.addBuilding(type, neighbors[0].q, neighbors[0].r, neighbors[1].q, neighbors[1].r, neighbors[2].q, neighbors[2].r);
            }

        }
        else {
            window.gameClient.showError("You can't build outside of the map");
        }

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
     * @param {Building} buildings
     * @param {Assets} assets
     */
    drawBuilding(buildings, assets){
        for(let b in buildings){
            let building = buildings[b];
            let x = 0;
            let y = 0;
            for(let i = 0; i < building.coords.length; i++){
                let q = building.coords[i][0];
                let r = building.coords[i][1];
                let hex = {q,r};
                let point = this.hexToPixel(hex);
                x += point.x;
                y += point.y;
            }
            x /= building.coords.length;
            y /= building.coords.length;
            this.ctx.filter = gameClient.getColors()[building.player];
            this.ctx.drawImage(assets.get(building.type), x - this.hexWidth/8, y - this.hexHeight/8, this.hexWidth/4, this.hexHeight/4);
            this.ctx.filter = "none";
        }
    }

    /**
     * draws a connection between two corner points
     * @param {Connection[]} connections
     */
    drawConnection(connections){
         for(let c in connections){
             let connection = connections[c];
             let hexCorner = [];
             for(let i = 0; i < connection.coords.length; i++){
                 let q = connection.coords[i][0];
                 let r = connection.coords[i][1];
                 let hex = {q,r};
                 let center = this.hexToPixel(hex);
                 for (let i = 0; i <= 5; i++) {
                     let corner = this.hex_corner(center, i);
                     hexCorner.push(corner);
                 }
             }
             let duplicates = this.checkDuplicates(hexCorner);

             this.ctx.filter = gameClient.getColors()[connection.player];
             this.ctx.lineWidth = 5;
             this.drawLine(duplicates.pop(), duplicates.pop());
             this.ctx.lineWidth = 1;
             this.ctx.filter = "none";
         }
    }

    /**
     * draws a single hexagon using it's center
     * @param {Point} center
     */
    drawHex(center) {
        for (let i = 0; i <= 5; i++) {
            let start = this.hex_corner(center, i);
            let end = this.hex_corner(center, i + 1);
            this.drawLine({x: start.x, y: start.y}, {x: end.x, y: end.y});
        }
    }

    /**
     * draws a line between two points
     * @param {Point} start
     * @param {Point} end
     */
    drawLine(start, end) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = '#000000';
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
     * calculates the specific corner points of a hexagon
     * @param {Point} center
     * @param {int} i
     * @returns {Point}
     */
    hex_corner(center, i) {
        let angle_deg = 60 * i - 30;
        let angle_rad = Math.PI / 180 * angle_deg;
        return new Point(center.x + this.size * Math.cos(angle_rad),
            center.y + this.size * Math.sin(angle_rad));
    }

    /**
     * calculates the center of a hexagon
     * @param {Hex} hex
     * @returns {Point}
     */
    hexToPixel(hex) {
        let x = this.xOffset + this.size * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r) + this.hexOrigin.x;
        let y = this.yOffset + this.size * (3. / 2 * hex.r) + this.hexOrigin.y;
        return new Point(x, y);
    }

    /**
     * calculates the distance between two points
     * @param {Point} p1
     * @param {Point} p2
     * @returns {number}
     */
    calcDistance(p1, p2){
        let xdiff = Math.abs(p1.x - p2.x);
        let ydiff = Math.abs(p1.y - p2.y);
        let distance = Math.sqrt(Math.pow(xdiff,2) + Math.pow(ydiff,2));
        return distance;
    }

    /**
     * finds hexagon that contains the mouseclick
     * @param {Point} mouse
     * @returns {Point}
     */
    findHex(mouse){
        let hexPosition = this.hexcenters[0];
        let oldDistance = this.calcDistance(mouse, hexPosition.center);
        for (let i = 1; i < this.hexcenters.length; i++){
            let newDistance = this.calcDistance(mouse, this.hexcenters[i].center);
            if(newDistance < oldDistance){
                oldDistance = newDistance;
                hexPosition = this.hexcenters[i];
            }
        }
        return hexPosition;
    }

    /**
     *finds two neighbors of the hexagon depending on the corner point
     * @param {Hex} hex
     * @param {number} corner
     * @returns {Hex[]}
     */
    findNeighbors(hex, corner){
        let nearNeighbors = [];
        switch (corner){
            case 5: nearNeighbors.push(new Hex(NEIGHBOURS.TOP_LEFT[0] + hex.q, NEIGHBOURS.TOP_LEFT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.TOP_RIGHT[0] + hex.q, NEIGHBOURS.TOP_RIGHT[1] + hex.r));
                break;
            case 0: nearNeighbors.push(new Hex(NEIGHBOURS.TOP_RIGHT[0] + hex.q, NEIGHBOURS.TOP_RIGHT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.RIGHT[0] + hex.q, NEIGHBOURS.RIGHT[1] + hex.r));
                break;
            case 1: nearNeighbors.push(new Hex(NEIGHBOURS.RIGHT[0] + hex.q, NEIGHBOURS.RIGHT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.BOT_RIGHT[0] + hex.q, NEIGHBOURS.BOT_RIGHT[1] + hex.r));
                break;
            case 2: nearNeighbors.push(new Hex(NEIGHBOURS.BOT_RIGHT[0] + hex.q, NEIGHBOURS.BOT_RIGHT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.BOT_LEFT[0] + hex.q, NEIGHBOURS.BOT_LEFT[1] + hex.r));
                break;
            case 3: nearNeighbors.push(new Hex(NEIGHBOURS.BOT_LEFT[0] + hex.q, NEIGHBOURS.BOT_LEFT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.LEFT[0] + hex.q, NEIGHBOURS.LEFT[1] + hex.r));
                break;
            case 4: nearNeighbors.push(new Hex(NEIGHBOURS.LEFT[0] + hex.q, NEIGHBOURS.LEFT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.TOP_LEFT[0] + hex.q, NEIGHBOURS.TOP_LEFT[1] + hex.r));
                break;
        }
        return nearNeighbors;
    }

    /**
     * finds duplicated Values inside of an array
     * @param {Point[]} arr
     * @returns {Point[]}
     */
    checkDuplicates(arr){
        let duplicates = [];
        for (let i = 0; i < arr.length;i++){
            for (let x = 0; x < arr.length; x++){
                if(Math.round(arr[i].x * 100) / 100 === Math.round(arr[x].x * 100) / 100 && Math.round(arr[i].y * 100) / 100 === Math.round(arr[x].y * 100) / 100 && i != x){
                    duplicates.push(arr[i]);
                }
            }
        }
        return duplicates;
    }

    /**
     * draws the tiles and the background on the canvas
     * @param {Board} board
     * @param {Assets} assets
     */
    drawAssets(board, assets) {
        this.hexcenters = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.shadow.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.translate(this.xOffset*0.5+this.xWindOffset, this.yOffset*0.5+this.yWindOffset);
        this.background.fillRect(-this.xOffset*0.5-this.xWindOffset, -this.yOffset*0.5-this.yWindOffset, this.canvas.width, this.canvas.height);
        this.background.translate(-this.xOffset*0.5-this.xWindOffset, -this.yOffset*0.5-this.yWindOffset);
        this.xWindOffset+=this.xWind;
        this.yWindOffset+=this.yWind;

        for (let y = board.getMinY(); y <= board.getMaxY(); y++) {
            for (let x = board.getMinX(); x <= board.getMaxX(); x++) {
                let tile = board.getTile(x, y);
                if (typeof tile != "undefined" && tile != null) {
                    let center = this.hexToPixel(new Hex(x, y));
                    if (center.x >= -this.size && center.y >= -this.size && center.x <= this.canvas.width + this.size && center.y <= this.canvas.height + this.size) {
                        let botLeft = board.getTile(x + NEIGHBOURS.BOT_LEFT[0], y + NEIGHBOURS.BOT_LEFT[1]);
                        let botRight = board.getTile(x + NEIGHBOURS.BOT_RIGHT[0], y + NEIGHBOURS.BOT_RIGHT[1]);
                        if ((tile.type === TILE_TYPES.GRASS || tile.type === TILE_TYPES.DESERT || tile.type === TILE_TYPES.WATER) &&
                            (typeof botLeft == "undefined" || botLeft == null || typeof botRight == "undefined" || botRight == null)) {
                            this.ctx.drawImage(assets.get(tile.type + "_Border"), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight * 1.23);
                        }
                        else {
                            if (typeof Tile.getBackground(tile.type) != "undefined") {
                                let background = Tile.getBackground(tile.type);
                                if ((background === TILE_TYPES.GRASS || background === TILE_TYPES.DESERT || background === TILE_TYPES.WATER) &&
                                    (typeof botLeft == "undefined" || botLeft == null || typeof botRight == "undefined" || botRight == null)) {
                                    this.ctx.drawImage(assets.get(background + "_Border"), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight * 1.23);
                                }
                                else {
                                    this.ctx.drawImage(assets.get(Tile.getBackground(tile.type)), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);
                                }
                            }
                            this.ctx.drawImage(assets.get(tile.type), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);
                        }

                        this.hexcenters.push(new HexPosition(center, x, y));
                        this.drawHex(center);
                        //this.drawHexCoordinates(center, new Hex(x, y));
                    }
                    let shadow = this.hexToPixel(new Hex(x + NEIGHBOURS.BOT_RIGHT[0]*2, y + NEIGHBOURS.BOT_RIGHT[1]*2));
                    if (shadow.x >= -this.size && shadow.y >= -this.size && shadow.x <= this.canvas.width + this.size && shadow.y <= this.canvas.height + this.size) {
                        this.shadow.drawImage(assets.get("shadow"), shadow.x, shadow.y - (this.hexHeight / 2), this.hexWidth + 2, this.hexHeight + 2);
                    }
                }
            }
        }
    }
}
