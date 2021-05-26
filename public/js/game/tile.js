/**
 * Constant that stores the types of tiles
 * @type {{TREES: string, CROPS: string, GRASS: string, MOUNTAIN: string, DESERT: string, WATER: string}}
 */
export const TILE_TYPES = {
    GRASS: "grass",
    MOUNTAIN: "mountain",
    WATER: "water",
    DESERT: "desert",
    CROPS: "crops",
    TREES: "trees"
}

/**
 * Class that stores the type of a tile
 */
export class Tile {

    constructor(type) {
        this.type = type;
    }

    /**
     * Returns the type of the background of the specified type.
     * When the type has no background it will return undefined.
     * @param {string} type
     * @returns {string|undefined} Tile type
     */
    static getBackground(type) {
        switch (type) {
            case TILE_TYPES.CROPS:
            case TILE_TYPES.TREES:
            case TILE_TYPES.MOUNTAIN: return TILE_TYPES.GRASS;
            default: return undefined;
        }
    }
}
