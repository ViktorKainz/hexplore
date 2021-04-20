let joinForm = document.getElementById("joinForm");
let join = document.getElementById("join");

joinForm.addEventListener("submit", function(e) {
    e.preventDefault();
    if(join.value != "" && joinForm.reportValidity()) {
        joinRoom(join.value);
    }
});

let nameForm = document.getElementById("nameForm");
let name = document.getElementById("name");

nameForm.addEventListener("submit", function(e) {
    e.preventDefault();
    if(name.value != "" && nameForm.reportValidity()) {
        changeName(name.value);
    }
});





