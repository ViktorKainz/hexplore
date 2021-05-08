import {SocketClient} from "./socket_client.js";
import {GameClient} from "./game/game_client.js";

function resize() {
    let c = document.getElementById("canvas");
    c.setAttribute("width", window.innerWidth + "px");
    c.setAttribute("height", window.innerHeight + "px");
    if(typeof window.gameClient != "undefined") {
        window.gameClient.resize();
    }
}
resize();
window.onresize = resize;

window.socket = new SocketClient();
window.gameClient = new GameClient();

window.createRoom = function () {
    socket.createRoom();
}

window.joinRoom = function (room) {
    socket.joinRoom(room);
}

window.changeName = function (name) {
    socket.changeName(name);
}

async function gameLoop() {
    window.gameClient.drawBoard();
    setTimeout(gameLoop, 100);
}

gameLoop();
