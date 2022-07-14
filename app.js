var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
let helpers = require('handlebars-helpers')
// var fileUpload = require ('express-fileupload')



var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');




var db= require('./config/connection');
var session= require('express-session')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//cache 
app.use((req,res,next)=>{
  res.header('cache-control','private,no-cache,no-store,must revalidate')
  res.header('Expires','-1')
  res.header('Pragma','no-cache')
next();
})



app.use(session({secret:"key",cookie:{maxAge:60000000}}))

db.connect((err)=>{
  if(err)
  console.log("connection faild"+err); 
  else 
  console.log("connected") 
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("hbs",hbs.engine({helpers: {
  inc: function (value, options) {
    return parseInt(value) + 1;}},extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))
// app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error =  req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('');
});

module.exports = app;
