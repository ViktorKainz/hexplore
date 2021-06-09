import {Board} from "./board.js";
import {Resources} from "./resources.js";

/**
 * Constant that stores the types of buildings
 * @type {{CITY: string, HOUSE: string}}
 */
export const BUILDING_TYPES = {
    HOUSE: "house",
    CITY: "city"
}

/**
 * Constant that stores the costs of buildings
 * @type {{CITY: Resources, HOUSE: Resources}}
 */
export const BUILDING_COSTS = {
    HOUSE: new Resources(0,0,0,0),
    CITY: new Resources(3,0,0,2)
}

/**
 * Class that stores the type and the coordinates of a Building
 */
export class Building {

    constructor(player, type, x1, y1, x2, y2, x3, y3) {
        this.player = player;
        this.type = type;
        this.coords = [[x1,y1], [x2,y2], [x3, y3]].sort(Board.compareCoords);
    }
}
