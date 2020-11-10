var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');

const User = require('../models/user');

/* GET users listing. */
router.get('users/:username', function(req, res, next) {
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

var loginAuth = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
})

router.post('/login', loginAuth, function(req, res, next){
  //req.user
});

router.post('/logout', function(req, res, next){
  req.logout();
  req.flash('success_msg', 'Logged out success');
  res.redirect('/login');
})

module.exports = router;
