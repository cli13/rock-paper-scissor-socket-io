var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'uname', passwordField: 'pname'}, function(uname, pname, done){
            User.findOne({username: uname})
                .then(function(result){
                    if(!result){
                        console.log(result);
                        return done(null, false, {message: 'User is not found'});
                    }
                    bcrypt.compare(pname, result.password, function(err, isMatch){
                        if(err) throw err;
                        if(isMatch){
                            return done(null, result);
                        }else{
                            return done(null, false, {message: 'Wrong password'});
                        }
                    })
                })
        })
    )
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    });
}