import {SocketClient} from "./utility/socket_client.js";
import {GameClient} from "./game/game_client.js";

function resize() {
    let c = document.getElementById("canvas");
    c.setAttribute("width", window.innerWidth + "px");
    c.setAttribute("height", window.innerHeight + "px");
    let s = document.getElementById("shadow");
    s.setAttribute("width", window.innerWidth + "px");
    s.setAttribute("height", window.innerHeight + "px");
    let b = document.getElementById("background");
    b.setAttribute("width", window.innerWidth + "px");
    b.setAttribute("height", window.innerHeight + "px");
    if (typeof window.gameClient != "undefined") {
        window.gameClient.resize();
    }
}

resize();
window.onresize = resize;

window.socketClient = new SocketClient();
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

window.music = false;
window.toggleMusic = function () {
    let music = document.getElementById("music");
    let toggle = document.getElementById("musictoggle");
    if(window.music) {
        music.pause();
        toggle.innerText = "🔇";
    } else {
        music.play();
        toggle.innerText = "🔊";
    }
    window.music = !window.music;
}

let last = Date.now();
let fps = 0;
async function gameLoop() {
    if(Date.now() - last > 1000) {
        last = new Date();
        //document.getElementById("round").innerText = fps;
        fps = 0;
    }
    fps++;
    window.gameClient.drawBoard();
    setTimeout(gameLoop, 10);
}

gameLoop();
