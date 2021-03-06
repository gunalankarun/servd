var express = require('express.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var app = express().http().io();

var securenet = require('securenet-node')({
  securenetid: '8005235',
  securekey: 'nkEtX61oyqnu'
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.io.on('connection', function (socket) {

  socket.on('payEvent', function (data) {
    securenet.charge( {
      amount: data.price,
      paymentVaultToken: {
        customerId: '1337',
        paymentMethodId: '1',
        paymentType: 'CREDIT_CARD'
      },
      developerApplication: {
        developerId: 12345678,
        Version: '1.2'
      }
    }, function(err, res){
      if(err){
        return console.log(err);
      }
      console.log(res);
    });
    app.io.sockets.emit('paid', data);
  });
  socket.on('questionEvent', function (from, msg) {
    app.io.sockets.emit('question');
  });
  socket.on('infoEvent', function (from, msg) {
    app.io.sockets.emit('info');
  });
  socket.on('disconnect', function () {
    app.io.emit('user disconnected');
  });

  socket.on('chargeEvent', function (data) {
    app.io.sockets.emit('chargeEvent', data);
  });
});

app.post('/messages', function(req, res) {
  app.io.broadcast('loc', req.body.Body);
  console.log(req.body.Body);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(7076)
module.exports = app;
