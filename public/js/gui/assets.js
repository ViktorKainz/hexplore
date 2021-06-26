import {TILE_TYPES} from "../game/tile.js";
import {BUILDING_TYPES} from "../game/building.js";
import {CONNECTION_TYPES} from "../game/connection.js";

const folder = "assets/";

/**
 * Class that handles the loading of assets
 */
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
            [TILE_TYPES.TREES, "Trees.png"],
            [TILE_TYPES.GRASS + "_Border", "Grass_Border.png"],
            [TILE_TYPES.DESERT + "_Border", "Desert_Border.png"],
            [TILE_TYPES.WATER + "_Border", "Water_Border.png"],
            ["shadow", "Shadow.png"],
            [BUILDING_TYPES.HOUSE, "house.svg"],
            [BUILDING_TYPES.CITY, "city.svg"],
            [CONNECTION_TYPES.SHIP, "ship.svg"]
        ];
    }

    /**
     * Loads every asset in the to_load array
     */
    load() {
        for (let a in this.#to_load) {
            this.#loadAsset(this.#to_load[a][0], this.#to_load[a][1])
        }
    }

    /**
     * Loads the specified file and registers it with the specified name
     * @param {string} name
     * @param {string} file
     */
    #loadAsset(name, file) {
        let img = new Image();
        img.src = folder + file;
        this.#assets[name] = img;
        img.addEventListener("load", this.#assetLoaded());
    }

    /**
     * Dispatches the "loaded" event when every asset has been loaded
     */
    #assetLoaded() {
        this.loadedAssets++;
        if (this.loadedAssets === this.#to_load.length) {
            this.dispatchEvent(new Event('loaded'));
        }
    }

    /**
     * Returns the asset that has been registered with the specified name
     * @param {string} name
     * @returns {Image} Asset
     */
    get(name) {
        return this.#assets[name];
    }

    /**
     * Returns an svg image with the specified color
     * @param {string} name
     * @param {string} color
     * @returns {Promise<HTMLImageElement>}
     */
    loadSVGcolored(name, color) {
        let parts = window.location.href.split("/");
        return fetch(parts[0] + "//" + parts[2] + "/assets/" + name + ".svg")
            .then(r => r.text())
            .then(t => {
                let img = new Image();
                img.src = "data:image/svg+xml;base64," + btoa(t.replace("#000", color));
                return img;
            });
    }
}
