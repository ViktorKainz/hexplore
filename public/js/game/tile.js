export const TILE_TYPES = {
    GRASS: "grass",
    MOUNTAIN: "mountain",
    WATER: "water",
    DESERT: "desert",
    CROPS: "crops",
    TREES: "trees"
}


export class Tile {

    constructor(type) {
        this.type = type;
    }

    static getBackground(type) {
        switch (type) {
            case TILE_TYPES.CROPS:
            case TILE_TYPES.TREES:
            case TILE_TYPES.MOUNTAIN: return TILE_TYPES.GRASS;
            default: return undefined;
        }
    }
}
