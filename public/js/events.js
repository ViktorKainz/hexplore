let form = document.getElementById("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let code = document.getElementById("code").value;
    if(clicked == "create") {
        window.socket.createRoom();
    } else if(clicked == "join") {
        console.log(code);
        window.socket.joinRoom(code);
    }
    window.socket.changeName(name);
})
