var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.viewcount){
    req.session.viewcount += 1;
  }else{
    req.session.viewcount = 1;
  }
  res.render('index', {viewCount: req.session.viewcount} );
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/signup', function(req, res, next) {
  res.render('signup'); // render("signup",{ data: {test: "ing" , hello: "World"} })
});

router.post('/signup', function(req, res, next) {
  let errors = [];

  if(req.body.reg_pword != req.body.reg_pword_confirm){
    errors.push({msg: 'Passwords does not match'});
  }
  if(req.body.reg_pword.length < 4){
    errors.push({msg: 'Password should be longer than 4 characters'});
  }
  if(req.body.reg_uname.length < 4){
    errors.push({msg: 'Username should be longer than 4 characters'});
  }

  if(errors.length > 0){
    console.log(errors);
    res.render('signup', {errors: errors});
  }else{
  User.findOne({username: req.body.reg_uname})
    .then( (result) => {
      if(result){
      errors.push({msg: 'User already exists'})
      res.render('signup', {errors: errors});
      }else{
        const newUser = new User({
          username: req.body.reg_uname,
          password: req.body.reg_pword
        });
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save().then(user => {
              req.flash('success_msg','You are now registered and can log in');
              res.redirect('/login');
            })
          });
      });
      }
    })
  }
})


module.exports = router;
