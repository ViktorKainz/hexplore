export const types = {
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
            case types.GRASS: return "Grass.png";
            case types.MOUNTAIN: return "Mountain.png";
            case types.WATER: return "Water.png";
            case types.DESERT: return "Desert.png";
        }
    }
}

let t = new Tile(types.GRASS);
