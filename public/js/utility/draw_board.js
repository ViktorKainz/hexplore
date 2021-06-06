import {Tile, TILE_TYPES} from "../game/tile.js";
import {HexPosition} from "../game/hexposition.js";
import {NEIGHBOURS} from "../game/board.js";

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

        //Interaktivität --> bei Mausklick wird mit findHex der Mittelpunkt + q&r herausgefunden
        this.canvas.addEventListener("click", (e) => {
            let draw = window.gameClient.draw;
            // let hex = draw.pixelToHex(draw.point(e.x, e.y));
            let mouse = draw.point(e.x, e.y);
            let hexposition = draw.findHex(mouse);
            let center = hexposition.center;
            let hex = this.hex(hexposition.x, hexposition.y);

            let hexcorner = [];
            let nearestCorner = 0;
            let oldDistance = this.calcDistance(mouse, this.hex_corner(center, 0));
            hexcorner.push(this.hex_corner(center, 0));
            for (let i = 1; i <= 5; i++) {
                let corner = this.hex_corner(center, i);
                hexcorner.push(corner);
                let newDistance = this.calcDistance(mouse, corner);
                if (newDistance < oldDistance) {
                    nearestCorner = i;
                    oldDistance = newDistance;
                }
            }
            //Koordinaten des Eckpunktes
            let selCorner = hexcorner[nearestCorner];
            //Nachbarn des Hexagon
            let neighbors = this.findNeighbors(hex, nearestCorner);

        });

        this.resize();
    }

    resize() {
        this.hexOrigin = {x: this.canvas.width / 2, y: this.canvas.height / 2};

        this.hexHeight = this.size * 2;
        this.hexWidth = Math.sqrt(3) * this.size;
        this.vertDist = this.hexHeight * 3 / 4;

        this.background.fillStyle = this.clouds;
    }

    //Zeichnet ein einzelnes Hexagon
    drawHex(center) {
        for (let i = 0; i <= 5; i++) {
            let start = this.hex_corner(center, i);
            let end = this.hex_corner(center, i + 1);
            this.drawLine({x: start.x, y: start.y}, {x: end.x, y: end.y});
        }
    }

    //PunktZuPunkt-Verbindung
    drawLine(start, end) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = '#000000';
        this.ctx.stroke();
        this.ctx.closePath();
    }

    //Schreibt Koordinaten eines Hexagons
    drawHexCoordinates(center, hex) {
        this.ctx.fillText(hex.q, center.x - 7, center.y + 2);
        this.ctx.fillText(hex.r, center.x - 1, center.y + 2);
    }

    //berechnet Eckpunkte eines Hexagons
    hex_corner(center, i) {
        let angle_deg = 60 * i - 30;
        let angle_rad = Math.PI / 180 * angle_deg;
        return this.point(center.x + this.size * Math.cos(angle_rad),
            center.y + this.size * Math.sin(angle_rad));
    }

    //gibt den Mittelpunkt eines Hexagons zurück
    hex_to_pixel(hex) {
        let x = this.xOffset + this.size * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r) + this.hexOrigin.x;
        let y = this.yOffset + this.size * (3. / 2 * hex.r) + this.hexOrigin.y;
        return this.point(x, y);
    }

    //berechnet Distance zwischen zwei Punkten
    calcDistance(p1, p2) {
        let xdiff = Math.abs(p1.x - p2.x);
        let ydiff = Math.abs(p1.y - p2.y);
        let distance = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
        return distance;
    }

    //vergleicht Mouseklick mit Hexagons
    findHex(mouse) {
        let hexPosition = this.hexcenters[0];
        let oldDistance = this.calcDistance(mouse, hexPosition.center);
        for (let i = 1; i < this.hexcenters.length; i++) {
            let newDistance = this.calcDistance(mouse, this.hexcenters[i].center);
            if (newDistance < oldDistance) {
                oldDistance = newDistance;
                hexPosition = this.hexcenters[i];
            }
        }
        return hexPosition;
    }

    //findet Zwei Nachbarn des Hexagons abhängig vom Eckpunkt
    findNeighbors(hex, corner) {
        let nearNeighbors = [];
        switch (corner) {
            case 5:
                nearNeighbors.push(this.hex(NEIGHBOURS.TOP_LEFT[0] + hex.q, NEIGHBOURS.TOP_LEFT[1] + hex.r));
                nearNeighbors.push(this.hex(NEIGHBOURS.TOP_RIGHT[0] + hex.q, NEIGHBOURS.TOP_RIGHT[1] + hex.r));
                break;
            case 0:
                nearNeighbors.push(this.hex(NEIGHBOURS.TOP_RIGHT[0] + hex.q, NEIGHBOURS.TOP_RIGHT[1] + hex.r));
                nearNeighbors.push(this.hex(NEIGHBOURS.RIGHT[0] + hex.q, NEIGHBOURS.RIGHT[1] + hex.r));
                break;
            case 1:
                nearNeighbors.push(this.hex(NEIGHBOURS.RIGHT[0] + hex.q, NEIGHBOURS.RIGHT[1] + hex.r));
                nearNeighbors.push(this.hex(NEIGHBOURS.BOT_RIGHT[0] + hex.q, NEIGHBOURS.BOT_RIGHT[1] + hex.r));
                break;
            case 2:
                nearNeighbors.push(this.hex(NEIGHBOURS.BOT_RIGHT[0] + hex.q, NEIGHBOURS.BOT_RIGHT[1] + hex.r));
                nearNeighbors.push(this.hex(NEIGHBOURS.BOT_LEFT[0] + hex.q, NEIGHBOURS.BOT_LEFT[1] + hex.r));
                break;
            case 3:
                nearNeighbors.push(this.hex(NEIGHBOURS.BOT_LEFT[0] + hex.q, NEIGHBOURS.BOT_LEFT[1] + hex.r));
                nearNeighbors.push(this.hex(NEIGHBOURS.LEFT[0] + hex.q, NEIGHBOURS.LEFT[1] + hex.r));
                break;
            case 4:
                nearNeighbors.push(this.hex(NEIGHBOURS.LEFT[0] + hex.q, NEIGHBOURS.LEFT[1] + hex.r));
                nearNeighbors.push(this.hex(NEIGHBOURS.TOP_LEFT[0] + hex.q, NEIGHBOURS.TOP_LEFT[1] + hex.r));
                break;
        }
        console.log("hex");
        console.log(hex);
        console.log("corner: ");
        console.log(corner);
        console.log("nearNeighbors: ");
        console.log(nearNeighbors);
        return nearNeighbors;
    }


    /*
    pixelToHex(point){
        console.log(point);
        console.log(this.hexOrigin.x/this.size);
        let q = (Math.sqrt(3)/3 * (point.x)  -  1./3 * (point.y)) / this.size;
        let r = (2./3 * (point.y)) / this.size;
        console.log(q + " || " + r);
        return this.cubeToAxial(this.cubeRound(this.axialToCube(this.hex(q, r))));
    }

    cubeRound(cube) {
        let x = Math.round(cube.x);
        let y = Math.round(cube.y);
        let z = Math.round(cube.z);

        let  xdiff = Math.abs(x - cube.x);
        let  ydiff = Math.abs(y - cube.y);
        let  zdiff = Math.abs(z - cube.z);

        if(xdiff > ydiff && xdiff > zdiff){
            x = -y - z;
        }
        else if (ydiff > zdiff){
            y = -x - z;
        }
        else {
            z = -x - y;
        }
        return this.cube(x, y, z);
    }

    axialToCube(hex){
        let x = hex.q;
        let z = hex.r;
        let y = -x-z;
        return this.cube(x,y,z);
    }

    cubeToAxial(cube) {
        console.log(this.hex(cube.x, cube.z));
        return this.hex(cube.x, cube.z);
    }
    */

    //Koordinaten eines Punktes
    point(x, y) {
        return {x, y};
    }

    //Koordinaten eines Hexagons (row + queue)
    hex(q, r) {
        return {q, r};
    }

    //Cube coordinates
    cube(x, y, z) {
        return {x, y, z};
    }

    //Zeichnet Images auf das jeweilige Hexagon
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
                    let center = this.hex_to_pixel(this.hex(x, y));
                    if (center.x >= -this.size && center.y >= -this.size && center.x <= this.canvas.width + this.size && center.y <= this.canvas.height + this.size) {
                        if ((tile.type === TILE_TYPES.GRASS || tile.type === TILE_TYPES.DESERT || tile.type === TILE_TYPES.WATER) &&
                            (typeof board.getTile(x + NEIGHBOURS.BOT_LEFT[0], y + NEIGHBOURS.BOT_LEFT[1]) == "undefined" ||
                                typeof board.getTile(x + NEIGHBOURS.BOT_RIGHT[0], y + NEIGHBOURS.BOT_RIGHT[1]) == "undefined")) {
                            this.ctx.drawImage(assets.get(tile.type + "_Border"), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight * 1.23);
                        } else {
                            if (typeof Tile.getBackground(tile.type) != "undefined") {
                                let background = Tile.getBackground(tile.type);
                                if ((background === TILE_TYPES.GRASS || background === TILE_TYPES.DESERT || background === TILE_TYPES.WATER) &&
                                    (typeof board.getTile(x + NEIGHBOURS.BOT_LEFT[0], y + NEIGHBOURS.BOT_LEFT[1]) == "undefined" ||
                                        typeof board.getTile(x + NEIGHBOURS.BOT_RIGHT[0], y + NEIGHBOURS.BOT_RIGHT[1]) == "undefined")) {
                                    this.ctx.drawImage(assets.get(background + "_Border"), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight * 1.23);
                                } else {
                                    this.ctx.drawImage(assets.get(Tile.getBackground(tile.type)), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);
                                }
                            }
                            this.ctx.drawImage(assets.get(tile.type), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);
                        }
                        this.hexcenters.push(new HexPosition(center, x, y));
                        this.drawHex(center);
                        //this.drawHexCoordinates(center, this.hex(x, y));
                    }
                    let shadow = this.hex_to_pixel(this.hex(x + NEIGHBOURS.BOT_RIGHT[0]*2, y + NEIGHBOURS.BOT_RIGHT[1]*2));
                    if (shadow.x >= -this.size && shadow.y >= -this.size && shadow.x <= this.canvas.width + this.size && shadow.y <= this.canvas.height + this.size) {
                        this.shadow.drawImage(assets.get("shadow"), shadow.x, shadow.y - (this.hexHeight / 2), this.hexWidth + 2, this.hexHeight + 2);
                    }
                }
            }
        }
    }
}
