//Modules & set up =========================================================
var express      = require('express');
var app          = express();
var port         = process.env.PORT || 3000;
var bodyParser   = require('body-parser');
var morgan       = require('morgan');
var http         = require('http').Server(app);
var io           = require('socket.io')(http);

//app middlewares
//only show logs with arent testing
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Site - Routes ==================================================

io.on('connection', function(socket){
  console.log('a user connected');
});

//Server ========================================================= 
app.listen(port, function() {
    console.log('Listenning on port: ' + port);
});
