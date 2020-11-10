var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var socketio = require('socket.io');
var http = require('http');
var sharedsession = require("express-socket.io-session");
require('dotenv').config();
require('./config/passport')(passport);

var app = express();
var server = http.createServer(app);
var io = socketio(server);

const uri = 'mongodb+srv://' + process.env.MONGO_UNAME + ':'+ process.env.MONGO_PWORD + '@cluster0.zwtlr.mongodb.net/'+ process.env.MONGO_DB_NAME +'?retryWrites=true&w=majority';
const dbconnection = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
const sessionStore = new MongoStore({
  mongooseConnection: dbconnection,
  collection: 'sessions'
})
mongoose.set('useCreateIndex', true);

var sessionMiddleware  = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {maxAge: 1000 * 60 * 60 * 2} // 2 hours 
});

io.use(sharedsession(sessionMiddleware,{autoSave: true}));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gameRouter = require('./routes/game')(io);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error = req.flash('error');
  next();
})

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/game', gameRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app, server};
