let form = document.getElementById("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let code = document.getElementById("code").value;
    if(clicked === "create") {
        socketClient.createRoom();
    } else if(clicked === "join") {
        socketClient.joinRoom(code);
    }
    socketClient.changeName(name);
    localStorage.setItem("name", name);
})

window.build = function (type){
    if(gameClient.myTurn) {
        document.getElementById("canvas").addEventListener("click", window.gameClient.draw.clickevent);
        window.buildtype = type;
    } else {
        gameClient.showError("It isn`t your turn yet!");
    }
};

window.next = function () {
    socketClient.finish();
}

document.getElementById("name").value = localStorage.getItem("name");

document.getElementById("chatForm").addEventListener("submit", function (e) {
   e.preventDefault();
   let input = document.getElementById("chatInput");
   if(input.value) {
       socketClient.sendMessage(input.value);
       input.value = "";
   }
});

document.getElementById("code").value = location.search.substr(1,location.search.length-1);
history.replaceState(null, "", window.location.pathname);
