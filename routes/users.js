var express = require('express');
var router = express.Router();

const User = require('../models/user');

/* GET users listing. */
router.get('/:username', function(req, res, next) {
  const user = req.params.username;
  User.find({ username: user})
  .then((result)=>{
    if(result.length == 0){
      res.sendStatus(404);
    }else{
      res.sendStatus(200);
    }
  }).catch((err)=>{
    console.log(err);
  })
});

module.exports = router;
