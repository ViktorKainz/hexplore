import {SocketClient} from "./utility/socket_client.js";
import {GameClient} from "./game/game_client.js";

function resize() {
    let c = document.getElementById("canvas");
    c.setAttribute("width", window.innerWidth + "px");
    c.setAttribute("height", window.innerHeight + "px");
    if (typeof window.gameClient != "undefined") {
        window.gameClient.resize();
    }
}

resize();
window.onresize = resize;

window.socket = new SocketClient();
window.gameClient = new GameClient();
window.onkeypress = window.gameClient.keyHandler;

window.createButton = function () {
    window.clicked = 'create';
    document.getElementById("code").required = false;
}

window.joinButton = function () {
    window.clicked = 'join';
    document.getElementById("code").required = true;
    document.getElementById("code").value = document.getElementById("code").value.toUpperCase();
}

window.removeError = function (element) {
    element.parentElement.classList.add("remove");
    setTimeout(() => {
        element.parentElement.nextElementSibling.remove();
        element.parentElement.remove();
    },1000);
}

async function gameLoop() {
    window.gameClient.drawBoard();
    setTimeout(gameLoop, 10);
}

gameLoop();
