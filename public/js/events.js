let form = document.getElementById("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let code = document.getElementById("code").value;
    if(clicked === "create") {
        socket.createRoom();
    } else if(clicked === "join") {
        socket.joinRoom(code);
    }
    socket.changeName(name);
    localStorage.setItem("name", name);
})

window.build = function (type){
    document.getElementById("canvas").addEventListener("click", window.gameClient.draw.clickevent);
    window.buildtype = type;
};

document.getElementById("name").value = localStorage.getItem("name");
