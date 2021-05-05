export const TILE_TYPES = {
    GRASS: "grass",
    MOUNTAIN: "mountain",
    WATER: "water",
    DESERT: "desert"
}

const folder = "assets/";

export class Tile {

    constructor(type) {
        this.type = type;
    }

    getAsset() {
        let img = new Image();
        switch (this.type) {
            case TILE_TYPES.GRASS: img.src = folder + "Grass.png";break;
            case TILE_TYPES.MOUNTAIN: img.src = folder + "Mountain.png";break;
            case TILE_TYPES.WATER: img.src = folder + "Water.png";break;
            case TILE_TYPES.DESERT: img.src = folder + "Desert.png";break;
        }
        return img;
    }
}
