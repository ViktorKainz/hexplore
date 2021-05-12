import {Board} from "./board.js";

export const CONNECTION_TYPES = {
    STREET: "street",
    SHIP: "ship"
}

export class Connection {

    constructor(player, type, x1, y1, x2, y2) {
        this.player = player;
        this.type = type;
        this.coords = [[x1,y1], [x2,y2]].sort(Board.compareCoords);
    }
}
