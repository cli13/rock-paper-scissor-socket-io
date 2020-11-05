var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/signup', function(req, res, next) {
  res.render('signup'); // render("signup",{ data: {test: "ing" , hello: "World"} })
});

router.post('/signup', function(req, res, next) {
  //TODO:
  //2 checks
  //1)do some checking from db to make sure no unique id {redirect to signup with error}
  //2)do checking from two password to make sure they're the same {redirect to sign up with error}

  //if everything passes do 2 things
  //1)encrpyt password
  //2)upload username to database
  //redirect to index
  const user = new User({
    username: req.body.reg_uname,
    password: req.body.reg_pword //should be encrytped
  })
  user.save().then((result)=>{console.log(result)});
  res.redirect('/');
});





module.exports = router;
