const express = require('express');
const app = require('../app');
const router = express.Router();

var auth = require('../config/auth');
const Room = require('../models/room');
const Result = require('../models/result');

var uniqueID = 0;
//keep track of number of players in room
var numClients = {};

router.get('/', auth.ensureAuthenticated, function(req, res, next){
    req.session.username = req.user.username;
    req.session.room = req.query.id;
    res.render(`${req.query.game}`, {user: req.user, id: req.query.id});
});

router.post('/create', auth.ensureAuthenticated, function(req, res, next){
    var str = req.body.game;
    uniqueID++;
    res.redirect('/game?game=' + str + '&id=' + uniqueID);
});

module.exports = function (io) {
    io.on('connection', function (socket) {
        socket.on('joinRoom', function(data){
            socket.join(data.roomID);
            socket.room = data.roomID;
            if (numClients[socket.room] == undefined) {
                numClients[socket.room] = 1;
            } else {
                numClients[socket.room]++;
            }
            Room.findOne({roomID: data.roomID})
                .then(function(result){
                    if(result){
                        if(result.player1 == data.username || result.player2 == data.username){
                            console.log("refresh");
                        }
                        else if(result.player1 != null && result.player2 != null){
                            var str = encodeURIComponent=('Room is full please join another room')
                            io.to(socket.room).emit('message', {user: data.username, message: `${data.username} tried to join, but room was full`})
                            socket.emit('redirect', `/?error=${str}`)
                        }else if(result.player1 == null){
                            socket.handshake.session.room = data.roomID;
                            result.player1 = data.username;
                            result.save();
                        }else if(result.player2 == null){
                            socket.handshake.session.room = data.roomID;
                            result.player2 = data.username;
                            result.save();
                        }
                    }else{
                        const newRoom = new Room({
                            roomID: data.roomID,
                            player1: data.username,
                            player2: null,
                            game: data.game
                        })
                        newRoom.save();
                    }
                }).catch(function(err){
                    console.log("error at create room\n" + err);
                })
            if(numClients[socket.room] <= 2){
                io.to(socket.room).emit('message', {user: 'server', message: `${socket.handshake.session.username} has joined the room`})
            }
            if(numClients[socket.room] == 2){
                io.to(socket.room).emit('gameReady', true);
            }
        });
        socket.on('chatMessage', function(data){
            io.to(socket.room).emit('message', {user: data.user, message: data.message});
        });

        socket.on('outputDisplay', function(message){
            io.to(socket.room).emit('display', message);
        })

        socket.on('input', function(data){
            if(socket.input == undefined){
                socket.input = data;
            }
            io.to(socket.room).emit('made choice', `${data.username} has made a choice`);
        })

        socket.on('giveResults', function(){
            io.to(socket.room).emit('displayResult', socket.input);
        })

        socket.on('playAgain', function(){
            io.to(socket.room).emit('clearOutput', true);
        })

        socket.on('setState', function(data){
            io.to(socket.room).emit('gameReady', data);
        })

        // socket.on('saveResult', function(data){
        //     const newResult = new Result({
        //         winner: data.winner,
        //         loser: data.loser,
        //         game: 'Rock Paper Scissor'
        //     })
        //     newResult.save();
        // })

        socket.on('disconnect', function(){
            let user = socket.handshake.session.username;
            if(numClients <= 2){
                io.to(socket.room).emit('clearOutput', false);
            }
            numClients[socket.room]--;
            io.to(socket.room).emit('message', {user: 'server', message: `${user} has left the room`});
            Room.findOne({roomID: socket.room})
                .then(function(result){
                    if(result.player1 == user){
                        result.player1 = null;
                    }else if(result.player2 == user){
                        result.player2 = null;
                    }
                    if(result.player1 == null && result.player2 == null){
                        result.remove();
                    }else{
                        result.save().catch('error at saving result');
                    }
                })
        })
    })
    return router;
};