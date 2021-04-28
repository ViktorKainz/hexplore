export const TILE_TYPES = {
    GRASS: "grass",
    MOUNTAIN: "mountain",
    WATER: "water",
    DESERT: "desert"
}

export class Tile {

    constructor(type) {
        this.type = type;
    }

    getAsset() {
        switch (this.type) {
            case TILE_TYPES.GRASS: return "Grass.png";
            case TILE_TYPES.MOUNTAIN: return "Mountain.png";
            case TILE_TYPES.WATER: return "Water.png";
            case TILE_TYPES.DESERT: return "Desert.png";
        }
    }
}
