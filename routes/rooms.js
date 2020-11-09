var express = require('express');
const room = require('../models/room');
var router = express.Router();

const Room = require('../models/room');

router.get('/list', function(req, res, next) {
    Room.find({}).then(function(result){
        res.json(result);
    })
});

module.exports = router;