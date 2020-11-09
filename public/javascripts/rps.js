const socket = io();

const params = new URLSearchParams(window.location.search);
const roomGame = params.get('game');
const roomID = params.get('id');

var roomdata = {roomID: roomID, username: username, game: roomGame};

socket.on('connect', function(){
    socket.emit('joinRoom', roomdata);
})

socket.on('redirect', function(data){
    window.location.href = data;
})

const chatDiv =  document.querySelector('.chat-content');
const messageInput = document.querySelector('#msg.form-control');

socket.on('message', function(data) {
    displayMessage(data);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    messageInput.value = '';
});



let form = document.getElementById('input-form-chat');

form.addEventListener('submit', function(e){
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', {user: username, message: msg, roomID: roomID});
})

function displayMessage(data){
    const li = document.createElement('LI');
    li.innerHTML = `${data.user}: ${data.message}`;
    document.querySelector('.chat-message').appendChild(li);
}