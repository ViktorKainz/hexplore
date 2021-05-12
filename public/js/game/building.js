import {Board} from "./board.js";

export const BUILDING_TYPES = {
    HOUSE: "house",
    CITY: "city"
}

export class Building {

    constructor(player, type, x1, y1, x2, y2, x3, y3) {
        this.player = player;
        this.type = type;
        this.coords = [[x1,y1], [x2,y2], [x3, y3]].sort(Board.compareCoords);
    }
}
