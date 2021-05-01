import express from "express";
import {SocketServer} from "./private/socket_server.js";

const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

app.use(express.static("public"));

const socketServer = new SocketServer(server);



