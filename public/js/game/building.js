import {Board} from "./board.js";
import {Resources} from "./resources.js";

export const BUILDING_TYPES = {
    HOUSE: "house",
    CITY: "city"
}

export const BUILDING_COSTS = {
    HOUSE: new Resources(1,1,1,1),
    CITY: new Resources(3,0,0,2)
}

export class Building {

    constructor(player, type, x1, y1, x2, y2, x3, y3) {
        this.player = player;
        this.type = type;
        this.coords = [[x1,y1], [x2,y2], [x3, y3]].sort(Board.compareCoords);
    }
}
