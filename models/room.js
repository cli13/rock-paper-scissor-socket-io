const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    roomID: Number,
    player1: String,
    player2: String,
    game: String
});

module.exports = mongoose.model('Room', roomSchema);