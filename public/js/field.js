

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
