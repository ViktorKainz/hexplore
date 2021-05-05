import {Tile} from "./game/tile.js";

export class DrawBoard {

    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.size = 17;
        this.hexOrigin = {x: this.canvas.width / 2, y: this.canvas.height / 2};

        this.hexHeight = this.size * 2;
        this.hexWidth = Math.sqrt(3) * this.size;
        this.vertDist = this.hexHeight * 3 / 4;
    }

    //Zeichnet Hexagons nebeneinander bzw. untereinander: r-> row, q->queue
    drawHexes() {
        let qLeftSide = Math.round(this.hexOrigin.x / this.hexWidth) * 4;
        let qRightSide = Math.round((this.canvas.width - this.hexOrigin.x) / this.hexWidth) * 2;
        let rTopSide = Math.round(this.hexOrigin.y / (this.hexHeight / 2));
        let rBottomSide = Math.round((this.canvas.height - this.hexOrigin.y) / (this.hexHeight / 2));
        for (let r = -rTopSide; r <= rBottomSide; r++) {
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                let center = this.hex_to_pixel(this.hex(q, r));
                if ((center.x > this.hexWidth / 2 && center.x < this.canvas.width - this.hexWidth / 2)
                    && (center.y > this.hexHeight / 2 && center.y < this.canvas.height - this.hexHeight / 2)) {
                    this.drawHex(center);
                    this.drawHexCoordinates(center, this.hex(q, r));
                    let tile = new Tile("mountain");
                    this.drawImageByCoords(this.hex(q,r), tile);
                }
            }
        }
    }

    //Zeichnet ein einzelnes Hexagon
    drawHex(center) {
        let img = new Image();
        img.src = "assets/Grass.png"
        this.ctx.drawImage(img, center.x - this.hexWidth/2, center.y - this.hexHeight/2, this.hexWidth, this.hexHeight);
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
        this.ctx.fillText(hex.q, center.x - 11, center.y);
        this.ctx.fillText(hex.r, center.x + 5, center.y);
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
        let x = this.size * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r) + this.hexOrigin.x;
        let y = this.size * (3. / 2 * hex.r) + this.hexOrigin.y;
        return this.point(x, y);
    }

    //Koordinaten eines Punktes
    point(x, y) {
        return {x, y};
    }

    //Koordinaten eines Hexagons
    hex(q, r) {
        return {q, r};
    }

    //
    drawAssets(board){
        console.log(board.map);
        for(let x = board.getMinX(); x <= board.getMaxX(); x++){
            for(let y = board.getMinY(); y <= board.getMaxY(); y++){
                console.log("Hi from before tile");
                let tile = board.getTile(x,y);
                console.log("Hi from before undefinded");
                if(typeof tile != "undefined"){
                    let center = this.hex_to_pixel(this.hex(x,y));
                    this.ctx.drawImage(tile.getAsset(), center.x - (this.hexWidth/2),center.y - (this.hexHeight/2), this.hexWidth, this.hexHeight);
                    console.log("Hi from drawAssets");
                }
            }
        }

    }
}
