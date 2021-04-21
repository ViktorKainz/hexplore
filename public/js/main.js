import {Socket} from "./socket.js";

window.socket = new Socket();

window.createRoom = function () {
    socket.createRoom();
}

window.joinRoom = function (room) {
    socket.joinRoom(room);
}

window.changeName = function (name) {
    socket.changeName(name);
}

import {Tile, types as TileTypes} from "./game/tile.js";
import {Board} from "./game/board.js";

let b = new Board();
b.setTile(0,0,new Tile(TileTypes.GRASS));
b.setTile(0,-1,new Tile(TileTypes.DESERT));
b.setTile(-1,0,new Tile(TileTypes.MOUNTAIN));
b.setTile(-1,-1,new Tile(TileTypes.WATER));
