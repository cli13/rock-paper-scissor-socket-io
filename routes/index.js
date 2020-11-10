var express = require('express');
var router = express.Router();

const Room = require('../models/room');

/* GET home page. */
router.get('/', function(req, res, next) {
  Room.find({}).then(function(result){
    res.render('index', {roomlist: result, user: req.user, query: req.query} );
  })
});

module.exports = router;
