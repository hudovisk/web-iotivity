//Modules & set up =========================================================
var app          = require('express')();
var port         = process.env.PORT || 3000;
var bodyParser   = require('body-parser');
var morgan       = require('morgan');
var http         = require('http').Server(app);
var io           = require('socket.io')(http);

var ledResource = {
  uri: "/a/led",
  power: 100,
  state: 1
};

var deviceInfo = {
  ip: "127.0.0.1",
  port: 123
}

//app middlewares
//only show logs with arent testing
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// set the view engine to ejs
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Site - Routes ==================================================
app.get('/', function (req, res) {
    res.render('index.html', 
      {
        led: ledResource,
        device: deviceInfo
      });
});

app.get('/getLed', function(req, res) {
    console.log("getLed");
});

app.post('/putLed', function(req, res) {
    console.log(req.body);
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on("new device", function(device) {
    console.log("New device");
    console.log(device);

    deviceInfo.ip = device.addr;
    deviceInfo.port = deviceInfo.port;

  });
  socket.on("get response", function(getResponse) {
    console.log("Get response");
    console.log(getResponse);

    ledResource.uri = getResponse.uri;
    ledResource.power = getResponse.power;
    ledResource.state = getResponse.state;

    socket.emit("put");
  });
});

//Server ========================================================= 
http.listen(port, function() {
    console.log('Listenning on port: ' + port);
});
