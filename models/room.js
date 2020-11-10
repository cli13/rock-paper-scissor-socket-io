const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    roomID: Number,
    player1: String,
    player2: String,
    game: String,
    expire_at: {type: Date, default: Date.now, expires: 7200} 
});

module.exports = mongoose.model('Room', roomSchema);