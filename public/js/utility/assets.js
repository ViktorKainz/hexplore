import {TILE_TYPES} from "../game/tile.js";

const folder = "assets/";

export class Assets extends EventTarget {
    #to_load;
    #assets = [];

    constructor() {
        super();
        this.loadedAssets = 0;
        this.#to_load = [
            [TILE_TYPES.GRASS, "Grass.png"],
            [TILE_TYPES.MOUNTAIN, "Mountain.png"],
            [TILE_TYPES.WATER, "Water.png"],
            [TILE_TYPES.DESERT, "Desert.png"],
            [TILE_TYPES.CROPS, "Crops.png"],
            [TILE_TYPES.TREES, "Trees.png"]
        ];
    }

    load() {
        for(let a in this.#to_load) {
            this.#loadAsset(this.#to_load[a][0],this.#to_load[a][1])
        }
    }

    #loadAsset(name, file) {
        let img = new Image();
        img.src = folder + file;
        this.#assets[name] = img;
        img.addEventListener("load",this.#assetLoaded());
    }

    #assetLoaded() {
        this.loadedAssets++;
        if(this.loadedAssets == this.#to_load.length) {
            this.dispatchEvent(new Event('loaded'));
        }
    }

    get(name) {
        return this.#assets[name];
    }

}
