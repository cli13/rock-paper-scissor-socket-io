const express = require('express');
const app = require('../app');
const router = express.Router();

var auth = require('../config/auth');
const Room = require('../models/room');

var uniqueID = 0;

router.get('/', auth.ensureAuthenticated, function(req, res, next){
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
            socket.handshake.session.room = data.roomID;
            Room.findOne({roomID: data.roomID})
                .then(function(result){
                    if(result){
                        if(result.player1 == data.username || result.player2 == data.username){
                            console.log("refresh");
                        }
                        else if(result.player1 != null && result.player2 != null){
                            var str = encodeURIComponent=('room is full')
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
            io.to(data.roomID).emit('message', {user: 'server', message: `${socket.handshake.session.username} has joined the chat`})
        });
        socket.on('chatMessage', function(data){
            io.to(data.roomID).emit('message', {user: data.user, message: data.message});
        });
        socket.on('disconnect', function(){
            let id = socket.handshake.session.room;
            let user = socket.handshake.session.username;
            io.to(id).emit('message', {user: 'server', message: `${user} has left the room`});
            Room.findOne({roomID: id})
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