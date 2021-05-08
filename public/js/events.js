let form = document.getElementById("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let code = document.getElementById("code").value;
    if(window.clicked == "create") {
        window.socket.createRoom();
    } else if(window.clicked == "join") {
        console.log(code);
        window.socket.joinRoom(code);
    }
    window.socket.changeName(name);
    localStorage.setItem("name", name);
})

document.getElementById("name").value = localStorage.getItem("name");
