const mongoose = require('mongoose');

const resultSchema = mongoose.Schema({
    winner: String,
    loser: String,
    tie: {type: Boolean,
          default: false},
    date: {type: Date,
           default: Date.now },
    game: {type: String,
           default: 'Rock Paper Scissor'}
});

module.exports = mongoose.model('Result', resultSchema);