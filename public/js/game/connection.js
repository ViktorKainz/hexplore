import {Board} from "./board.js";
import {Resources} from "./resources.js";

/**
 * Constant that stores the types of connections
 * @type {{SHIP: string, STREET: string}}
 */
export const CONNECTION_TYPES = {
    STREET: "street",
    SHIP: "ship"
}

/**
 * Constant that stores the costs of connections
 * @type {{SHIP: Resources, STREET: Resources}}
 */
export const CONNECTION_COSTS = {
    STREET: new Resources(1,1,0,0),
    SHIP: new Resources(0,1,1,0)
}

/**
 * Class that stores the type and the coordinates of a Connection
 * @author Viktor Kainz
 */
export class Connection {

    constructor(player, type, x1, y1, x2, y2) {
        this.player = player;
        this.type = type;
        this.coords = [[x1,y1], [x2,y2]].sort(Board.compareCoords);
    }
}
