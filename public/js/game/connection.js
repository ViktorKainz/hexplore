import {Board} from "./board.js";
import {Resources} from "./resources.js";

export const CONNECTION_TYPES = {
    STREET: "street",
    SHIP: "ship"
}

export const CONNECTION_COSTS = {
    STREET: new Resources(1,1,0,0),
    SHIP: new Resources(0,1,1,0)
}

export class Connection {

    constructor(player, type, x1, y1, x2, y2) {
        this.player = player;
        this.type = type;
        this.coords = [[x1,y1], [x2,y2]].sort(Board.compareCoords);
    }
}
