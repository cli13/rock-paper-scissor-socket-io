const socket = io();

const params = new URLSearchParams(window.location.search);
const roomGame = params.get('game');
const roomID = params.get('id');
const buttons = document.querySelectorAll('.btn.btn-primary');
const gameOutput = document.getElementById('gameOutput');

var gameReady = false;
var roomdata = {roomID: roomID, username: username, game: roomGame};

socket.on('connect', function(){
    socket.emit('joinRoom', roomdata);
})

socket.on('redirect', function(data){
    window.location.href = data;
})

socket.on('gameReady', function(data){
    gameReady = data;
    if(gameReady){
        buttons.forEach(function(button){
            button.disabled = false;
            gameState(gameReady);
        })
    }else{
        buttons.forEach(function(button){
            button.disabled = true;
            gameState(gameReady)
        })
    }
})


function sendInput(input){
    socket.emit('input', {input: input, username: username});
    buttons.forEach(function(button){
        button.disabled = true;
    })
}

let choice = 0;

socket.on('made choice', function(data){
    let p = document.createElement('P')
    let t = document.createTextNode(data);
    p.appendChild(t);
    gameOutput.appendChild(p);
    choice++;
    if(choice == 2){
        socket.emit('giveResults')
        choice = 0;
    }
})

let results = [];
socket.on('displayResult', function(data){
    results.push(data);
    // to remove type error
    if(results.length == 2){
        let d = evalWinner(results);
        let p = document.createElement('P');
        p.appendChild(document.createTextNode(d));
        gameOutput.appendChild(p);
        let b = document.createElement('BUTTON');
        b.appendChild(document.createTextNode('Play again?'));
        b.setAttribute('onclick', 'playAgain()');
        b.classList.add('btn');
        b.classList.add('btn-primary');
        gameOutput.append(b);
    }
})

function playAgain(){
    socket.emit('playAgain', username);
    socket.emit('outputDisplay', `${username} wanted to play again`);
}

socket.on('display', function(message){
    let p = document.createElement('P');
    p.appendChild(document.createTextNode(message));
    gameOutput.append(p);
})

socket.on('clearOutput', function(data){
    results = [];
    gameOutput.innerHTML = '<p id="gameState" class="font-weight-bold"></p>'; 
    socket.emit('setState', data);
})

function evalWinner(data){
    let str = `${data[0].username} picked ${data[0].input} and ${data[1].username} picked ${data[1].input}`
    if(data[0].input === data[1].input){
        return str + ' Its a tie';
    }else if(data[0].input === 'rock' && data[1].input === 'scissor'){
        return str + ` ${data[0].username} is the winner`;
    }else if(data[0].input === 'paper' && data[1].input === 'rock'){
        return str + ` ${data[0].username} is the winner`;
    }else if(data[0].input === 'scissor' && data[1].input === 'paper'){
        return str + ` ${data[0].username} is the winner`;
    }else if(data[1].input === 'rock' && data[0].input === 'scissor'){
        return str + ` ${data[1].username} is the winner`;
    }else if(data[1].input === 'paper' && data[0].input === 'rock'){
        return str + ` ${data[1].username} is the winner`;
    }else if(data[1].input === 'scissor' && data[0].input === 'paper'){
        return str + ` ${data[1].username} is the winner`;
    }
}

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
    li.innerHTML = `<strong>[${data.user}]</strong> ${data.message}`;
    document.querySelector('.chat-message').appendChild(li);
}

function gameState(bool){
    if(bool){
        document.getElementById('gameState').style.color = 'green';
        document.getElementById('gameState').innerHTML = 'Game is ready';
    }else{
        document.getElementById('gameState').style.color = 'red';
        document.getElementById('gameState').innerHTML = 'Waiting another player to join';
    }
}