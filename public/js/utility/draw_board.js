import {Tile} from "../game/tile.js";

export class DrawBoard {

    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.size = 30;
        this.xOffset = 0;
        this.yOffset = 0;
        this.hexcenters = [];

        this.canvas.addEventListener("click", (e) => {
            let draw = window.gameClient.draw;
            // let hex = draw.pixelToHex(draw.point(e.x, e.y));
            let mouse = draw.point(e.x, e.y);
            let closestCenter = draw.findHex(mouse);

        });

        this.resize();
    }

    resize() {
        this.hexOrigin = {x: this.canvas.width / 2, y: this.canvas.height / 2};

        this.hexHeight = this.size * 2;
        this.hexWidth = Math.sqrt(3) * this.size;
        this.vertDist = this.hexHeight * 3 / 4;
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

    //vergleicht Mouseklick mit Hexagons
    findHex(mouse){
        let startXDiff = Math.abs(mouse.x - this.hexcenters[0].x);
        let startYDiff = Math.abs(mouse.y - this.hexcenters[0].y);
        let oldDistance = Math.sqrt(Math.pow(startXDiff,2) + Math.pow(startYDiff,2));
        let closestCenter = this.hexcenters[0];
        for (let i = 1; i < this.hexcenters.length; i++){
                let diffx = Math.abs(mouse.x - this.hexcenters[i].x);
                let diffy = Math.abs(mouse.y - this.hexcenters[i].y);
                let newDistance = Math.sqrt(Math.pow(diffx,2) + Math.pow(diffy,2));
                if(newDistance < oldDistance){
                    oldDistance = newDistance;
                    closestCenter = this.hexcenters[i];
                }
        }
        return closestCenter;
    }

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

    //Koordinaten eines Punktes
    point(x, y) {
        return {x, y};
    }

    //Koordinaten eines Hexagons (row + queue)
    hex(q, r) {
        return {q, r};
    }

    //Cube coordinates
    cube(x, y, z){
        return{x,y,z};
    }

    //Zeichnet Images auf das jeweilige Hexagon
    drawAssets(board, assets) {
        this.hexcenters = [];
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        for (let x = board.getMinX(); x <= board.getMaxX(); x++) {
            for (let y = board.getMinY(); y <= board.getMaxY(); y++) {
                let tile = board.getTile(x, y);
                if (typeof tile != "undefined" && tile != null) {
                    let center = this.hex_to_pixel(this.hex(x, y));
                    if(center.x >= -this.size && center.y >= -this.size && center.x <= this.canvas.width + this.size && center.y <= this.canvas.height + this.size) {
                        if (typeof Tile.getBackground(tile.type) != "undefined") {
                            this.ctx.drawImage(assets.get(Tile.getBackground(tile.type)), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);
                        }
                        this.ctx.drawImage(assets.get(tile.type), center.x - (this.hexWidth / 2), center.y - (this.hexHeight / 2), this.hexWidth, this.hexHeight);

                        this.hexcenters.push(center);
                        this.drawHex(center);
                        this.drawHexCoordinates(center, this.hex(x, y));
                    }
                }
            }
        }
    }
}
