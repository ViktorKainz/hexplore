import {SocketClient} from "./utility/socket_client.js";
import {GameClient} from "./game/game_client.js";
import {Resources} from "./game/resources.js";

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
    }, 1000);
}

window.music = false;
window.toggleMusic = function () {
    let music = document.getElementById("music");
    let toggle = document.getElementById("musictoggle");
    if (window.music) {
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
    if (Date.now() - last > 1000) {
        last = new Date();
        //document.getElementById("round").innerText = fps;
        fps = 0;
    }
    fps++;
    window.gameClient.drawBoard();
    setTimeout(gameLoop, 16);
}

gameLoop();

window.changeExchangeAmount = function (value) {
    document.getElementById("range").value = value;
    document.getElementById("output").value = value;
    document.getElementById("input").value = value * 4;
}

window.changeInput = function (value) {
    document.getElementById("out_stone").disabled = value === "stone";
    document.getElementById("out_wood").disabled = value === "wood";
    document.getElementById("out_wool").disabled = value === "wool";
    document.getElementById("out_crops").disabled = value === "crops";
    switch (value) {
        case "stone":
            document.getElementById("in_img").src = "assets/stone.svg";
            break;
        case "wood":
            document.getElementById("in_img").src = "assets/wood.svg";
            break;
        case "wool":
            document.getElementById("in_img").src = "assets/wool.svg";
            break;
        case "crops":
            document.getElementById("in_img").src = "assets/crop.svg";
            break;
    }
}

window.changeOutput = function (value) {
    document.getElementById("in_stone").disabled = value === "stone";
    document.getElementById("in_wood").disabled = value === "wood";
    document.getElementById("in_wool").disabled = value === "wool";
    document.getElementById("in_crops").disabled = value === "crops";
    switch (value) {
        case "stone":
            document.getElementById("out_img").src = "assets/stone.svg";
            break;
        case "wood":
            document.getElementById("out_img").src = "assets/wood.svg";
            break;
        case "wool":
            document.getElementById("out_img").src = "assets/wool.svg";
            break;
        case "crops":
            document.getElementById("out_img").src = "assets/crop.svg";
            break;
    }
}

window.showExchangeMenu = function () {
    document.getElementById("resourceExchangeMenu").style.display = "block";
}

window.exchange = function () {
    let in_type = document.getElementById("in_select").value;
    let in_amount = document.getElementById("input").value;
    let input = new Resources(0, 0, 0, 0);
    let out_type = document.getElementById("out_select").value;
    let out_amount = document.getElementById("output").value;
    let output = new Resources(0, 0, 0, 0);

    switch (in_type) {
        case "stone":
            input.stone = in_amount;
            break;
        case "wood":
            input.wood = in_amount;
            break;
        case "wool":
            input.wool = in_amount;
            break;
        case "crops":
            input.crops = in_amount;
            break;
    }

    switch (out_type) {
        case "stone":
            output.stone = out_amount;
            break;
        case "wood":
            output.wood = out_amount;
            break;
        case "wool":
            output.wool = out_amount;
            break;
        case "crops":
            output.crops = out_amount;
            break;
    }

    socketClient.exchange(input,output);

    document.getElementById("resourceExchangeMenu").style.display = "none";
}
