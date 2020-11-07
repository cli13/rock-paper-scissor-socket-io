var express = require('express');
const app = require('../app');
var router = express.Router();

var auth = require('../config/auth');
var uniqueID = 0;

router.get('/', auth.ensureAuthenticated, function(req, res, next){
    req.session.username = req.user.username;
    res.render(`${req.query.game}`, {user: req.user, id: req.query.id});
});

router.post('/', auth.ensureAuthenticated, function(req, res, next){
    var str = encodeURIComponent(req.body.game)
    uniqueID++;
    res.redirect('/game?game=' + str + '&id=' + uniqueID);
});

module.exports = function (io) {
    io.on('connection', function (socket) {
        socket.on('joinRoom', function(data){
            socket.join(data);
            io.to(data).emit('message',{user: 'server', message: `${socket.handshake.session.username} has joined the chat`})
        });
        socket.on('chatMessage', function(data){
            io.to(data.roomID).emit('message', {user: data.user, message: data.message});
        });
        socket.on('disconnect', function(data){
            io.to(data.roomID).emit('message', {user: 'server', message: `${socket.handshake.session.username} has left the room`})
        })
    });
    return router;
};