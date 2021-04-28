

let canvas = document.querySelector('canvas');

let ctx = canvas.getContext('2d');

let grass = new Image();
grass.src = "assets/Grass.png";
let mountain = new Image();
mountain.src = "assets/Mountain.png";
let water = new Image();
water.src = "assets/Water.png";
let desert = new Image();
desert.src = "assets/Desert.png";

let size = 17;//nicht sicher

//center von Canvas --> Koordinaten 0,0
let hexOrigin = {x: canvas.width /2, y:canvas.height/2};

//Höhe, Breite und vertikal Distanz eines Hexagons
let hexParameter = getHexParameter();

drawHexes();

//Zeichnet Hexagons nebeneinander bzw. untereinander: r-> row, q->queue
function drawHexes(){
    let qLeftSide =  Math.round(hexOrigin.x/hexParameter.hexWidth)*4;
    let qRightSide = Math.round((canvas.width - hexOrigin.x) / hexParameter.hexWidth)*2;
    let rTopSide =  Math.round(hexOrigin.y/(hexParameter.hexHeight/2));
    let rBottomSide = Math.round((canvas.height - hexOrigin.y) / (hexParameter.hexHeight/2));
    for (let r = -rTopSide; r <=  rBottomSide; r++){
        for (let q = -qLeftSide; q <= qRightSide; q++){
            let center = hex_to_pixel(hex(q, r));
            if ((center.x > hexParameter.hexWidth/2 && center.x < canvas.width - hexParameter.hexWidth/2)
                 && (center.y > hexParameter.hexHeight/2 && center.y < canvas.height - hexParameter.hexHeight/2)){
                drawHex(center);
                drawHexCoordinates(center, hex(q, r));
            }
        }
    }
}

//Zeichnet ein einzelnes Hexagon
function drawHex(center){
    //ctx.fillRect(center.x,center.y,1,1);
    for (let i = 0; i <= 5; i++){
        let start = hex_corner(center, i);
        let end = hex_corner(center, i + 1);
        drawLine({x: start.x, y: start.y}, {x: end.x, y: end.y});
    }
}

//PunktZuPunkt-Verbindung
function drawLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x,  end.y);
    ctx.stroke();
    ctx.closePath();
}

//Schreibt Koordinaten eines Hexagons
function drawHexCoordinates(center, hex){
    ctx.fillText(hex.q,center.x-11, center.y);
    ctx.fillText(hex.r,center.x+5, center.y);
}

//berechnet Eckpunkte eines Hexagons
function hex_corner(center, i) {
    var angle_deg = 60 * i - 30;
    var angle_rad = Math.PI / 180 * angle_deg;
    return point(center.x + size * Math.cos(angle_rad),
                 center.y + size * Math.sin(angle_rad));
}

//Höhe, Breite und vertikal Distanz eines Hexagons
function getHexParameter(){
   let hexHeight = size * 2;
   let hexWidth = Math.sqrt(3) * size;
   let vertDist = hexHeight * 3/4;
   return {hexHeight, hexWidth, vertDist};
}

//gibt den Mittelpunkt eines Hexagons zurück
function hex_to_pixel(hex){
    var x = size * (Math.sqrt(3) * hex.q  +  Math.sqrt(3)/2 * hex.r) + hexOrigin.x;
    var y = size * (3./2 * hex.r) + hexOrigin.y;
    return point(x, y);
}

//Koordinaten eines Punktes
function point(x, y) {
    return {x,y};
}

//Koordinaten eines Hexagons
function hex(q,r){
    return{q, r};
}

/* Testspielfeld
import {Tile, types as TileTypes} from "./game/tile.js";
import {Board} from "./game/board.js";

let board = new Board();
board.setTile(0,0,new Tile(TileTypes.GRASS));
board.setTile(0,-1,new Tile(TileTypes.DESERT));
board.setTile(-1,0,new Tile(TileTypes.MOUNTAIN));
board.setTile(-1,-1,new Tile(TileTypes.WATER));

let testarry = [board.getTile(0,0).getAsset(),
                board.getTile(0,-1).getAsset(),
                board.getTile(-1,0).getAsset(),
                board.getTile(-1,-1).getAsset()];

for (let i = 0; i < testarry.length; i++){
    createField(testarry[i]);
}

 function createField(field) {
    switch (field){
        case "Grass.png": grass.addEventListener('load', e => {
                                ctx.drawImage(grass, 0,0, 25, 26);
                            });break;
        case "Mountain.png": mountain.addEventListener('load', e => {
            ctx.drawImage(mountain, 25,0, 25, 26);
        });break;
        case "Water.png": water.addEventListener('load', e => {
            ctx.drawImage(water, 50,0, 25, 26);
        });break;
        case "Desert.png": desert.addEventListener('load', e => {
            ctx.drawImage(desert, 75,0, 25, 26);
        });break;

    }
}
*/