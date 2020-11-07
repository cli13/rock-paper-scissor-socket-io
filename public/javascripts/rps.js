const socket = io();

const params = new URLSearchParams(window.location.search);
const roomID = params.get('id');

socket.on('connect', function(){
    socket.emit('joinRoom', roomID);
})

const chatDiv =  document.querySelector('.chat-content');
const messageInput = document.querySelector('#msg.form-control');

socket.on('message', function(data) {
    displayMessage(data);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    messageInput.value = '';
});

socket.on('disconnect', function(){
    socket.disconnect();
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