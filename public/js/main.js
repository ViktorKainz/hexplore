import {SocketClient} from "./socket_client.js";
import {GameClient} from "./game/game_client.js";

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
