import {Point} from "./point.js";
import {Hex} from "./hex.js";
import {CONNECTION_TYPES} from "../game/connection.js";
import {BUILDING_TYPES} from "../game/building.js";
import {NEIGHBOURS} from "../game/board.js";

/**
 * Class that handles logic of the canvas
 * @author Koloman Moser
 */
export class CanvasInteractions {

    /**
     * adds a building or a connection depending on the selected button
     * @param {event} e
     */
    static clickevent(e) {
        let draw = window.gameClient.draw;
        let data = draw.ctx.getImageData(e.x, e.y, 1, 1).data;

        if (data[3] !== 0) {
            draw.canvas.removeEventListener("click", CanvasInteractions.clickevent);
            let type = window.buildtype;
            let mouse = new Point(e.x, e.y);
            let hexposition = CanvasInteractions.findHex(mouse);
            let center = hexposition.center;
            let hex = new Hex(hexposition.x, hexposition.y);
            let hexcorner = [];
            let nearestCorner = 0;
            let distances = [];
            let currentCorner = 0;
            let oldDistance = CanvasInteractions.calcDistance(mouse, CanvasInteractions.hexCorner(center, currentCorner));
            let newDistance = oldDistance;

            distances.push({newDistance, currentCorner});
            hexcorner.push(CanvasInteractions.hexCorner(center, currentCorner));

            for (currentCorner = 1; currentCorner <= 5; currentCorner++) {
                let corner = CanvasInteractions.hexCorner(center, currentCorner);
                hexcorner.push(corner);
                newDistance = CanvasInteractions.calcDistance(mouse, corner);
                distances.push({newDistance, currentCorner});
                if (newDistance < oldDistance) {
                    nearestCorner = currentCorner;
                    oldDistance = newDistance;
                }
            }

            let neighbors = CanvasInteractions.findNeighbors(hex, nearestCorner);

            if (type === CONNECTION_TYPES.STREET) {
                let distance1 = distances[0].currentCorner !== nearestCorner ? distances[0].newDistance : distances[1].newDistance;
                let distance2;
                let secNearCorner = distances[0].currentCorner !== nearestCorner ? distances[0].currentCorner : distances[1].currentCorner;

                for (let distance in distances) {
                    if (distances[distance].currentCorner !== nearestCorner) {
                        distance2 = distances[distance].newDistance;
                        if (distance1 > distance2) {
                            distance1 = distance2;
                            secNearCorner = distances[distance].currentCorner;
                        }
                    }
                }
                let otherNeighbors = CanvasInteractions.findNeighbors(hex, secNearCorner);

                let streetHex;

                for (let j = 0; j < otherNeighbors.length; j++) {
                    for (let l = 0; l < neighbors.length; l++) {
                        if (otherNeighbors[j].q === neighbors[l].q && otherNeighbors[j].r === neighbors[l].r) {
                            streetHex = neighbors[l];
                        }
                    }
                }
                window.socketClient.addConnection(type, hex.q, hex.r, streetHex.q, streetHex.r);
            } else if (type === BUILDING_TYPES.HOUSE || type === BUILDING_TYPES.CITY) {
                neighbors.push(hex);
                window.socketClient.addBuilding(type, neighbors[0].q, neighbors[0].r, neighbors[1].q, neighbors[1].r, neighbors[2].q, neighbors[2].r);
            }

        } else {
            window.gameClient.showError("You can't build outside of the map");
        }
    }

    /**
     * calculates the specific corner points of a hexagon
     * @param {Point} center
     * @param {int} i
     * @returns {Point}
     */
    static hexCorner(center, i) {
        let angle_deg = 60 * i - 30;
        let angle_rad = Math.PI / 180 * angle_deg;
        return new Point(center.x + gameClient.draw.size * Math.cos(angle_rad),
            center.y + gameClient.draw.size * Math.sin(angle_rad));
    }

    /**
     * calculates the center of a hexagon
     * @param {Hex} hex
     * @returns {Point}
     */
    static hexToPixel(hex) {
        let x = gameClient.draw.xOffset + gameClient.draw.size * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r) + gameClient.draw.hexOrigin.x;
        let y = gameClient.draw.yOffset + gameClient.draw.size * (3. / 2 * hex.r) + gameClient.draw.hexOrigin.y;
        return new Point(x, y);
    }

    /**
     * calculates the distance between two points
     * @param {Point} p1
     * @param {Point} p2
     * @returns {number}
     */
    static calcDistance(p1, p2) {
        let xdiff = Math.abs(p1.x - p2.x);
        let ydiff = Math.abs(p1.y - p2.y);
        return Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
    }

    /**
     * finds hexagon that contains the mouseclick
     * @param {Point} mouse
     * @returns {Point}
     */
    static findHex(mouse) {
        let hexPosition = gameClient.draw.hexcenters[0];
        let oldDistance = CanvasInteractions.calcDistance(mouse, hexPosition.center);
        for (let i = 1; i < gameClient.draw.hexcenters.length; i++) {
            let newDistance = CanvasInteractions.calcDistance(mouse, gameClient.draw.hexcenters[i].center);
            if (newDistance < oldDistance) {
                oldDistance = newDistance;
                hexPosition = gameClient.draw.hexcenters[i];
            }
        }
        return hexPosition;
    }

    /**
     *finds two neighbors of the hexagon depending on the corner point
     * @param {Hex} hex
     * @param {number} corner
     * @returns {Hex[]}
     */
    static findNeighbors(hex, corner) {
        let nearNeighbors = [];
        switch (corner) {
            case 5:
                nearNeighbors.push(new Hex(NEIGHBOURS.TOP_LEFT[0] + hex.q, NEIGHBOURS.TOP_LEFT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.TOP_RIGHT[0] + hex.q, NEIGHBOURS.TOP_RIGHT[1] + hex.r));
                break;
            case 0:
                nearNeighbors.push(new Hex(NEIGHBOURS.TOP_RIGHT[0] + hex.q, NEIGHBOURS.TOP_RIGHT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.RIGHT[0] + hex.q, NEIGHBOURS.RIGHT[1] + hex.r));
                break;
            case 1:
                nearNeighbors.push(new Hex(NEIGHBOURS.RIGHT[0] + hex.q, NEIGHBOURS.RIGHT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.BOT_RIGHT[0] + hex.q, NEIGHBOURS.BOT_RIGHT[1] + hex.r));
                break;
            case 2:
                nearNeighbors.push(new Hex(NEIGHBOURS.BOT_RIGHT[0] + hex.q, NEIGHBOURS.BOT_RIGHT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.BOT_LEFT[0] + hex.q, NEIGHBOURS.BOT_LEFT[1] + hex.r));
                break;
            case 3:
                nearNeighbors.push(new Hex(NEIGHBOURS.BOT_LEFT[0] + hex.q, NEIGHBOURS.BOT_LEFT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.LEFT[0] + hex.q, NEIGHBOURS.LEFT[1] + hex.r));
                break;
            case 4:
                nearNeighbors.push(new Hex(NEIGHBOURS.LEFT[0] + hex.q, NEIGHBOURS.LEFT[1] + hex.r));
                nearNeighbors.push(new Hex(NEIGHBOURS.TOP_LEFT[0] + hex.q, NEIGHBOURS.TOP_LEFT[1] + hex.r));
                break;
        }
        return nearNeighbors;
    }

    /**
     * finds duplicated Values inside of an array
     * @param {Point[]} arr
     * @returns {Point[]}
     */
    static checkDuplicates(arr) {
        let duplicates = [];
        for (let i = 0; i < arr.length; i++) {
            for (let x = 0; x < arr.length; x++) {
                if (Math.round(arr[i].x * 100) / 100 === Math.round(arr[x].x * 100) / 100 && Math.round(arr[i].y * 100) / 100 === Math.round(arr[x].y * 100) / 100 && i != x) {
                    duplicates.push(arr[i]);
                }
            }
        }
        return duplicates;
    }
}