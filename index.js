//Modules & set up =========================================================
var app          = require('express')();
var port         = process.env.PORT || 3000;
var bodyParser   = require('body-parser');
var morgan       = require('morgan');
var http         = require('http').Server(app);
var io           = require('socket.io')(http);

var devices = [];

var ledResource = {
  uri: "/a/led",
  power: 100,
  state: 1
};

var deviceInfo = {
  id: ""
}

var gatewaySocket;

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
    gatewaySocket.emit("get");
    res.redirect('../');
});

app.post('/putLed', function(req, res) {
    console.log(req.body);
    gatewaySocket.emit("put", 
      {
        uri: req.body.uri,
        power: parseInt(req.body.power),
        state: parseInt(req.body.state)
      });
    res.redirect('../');
});

io.on('connection', function(socket){
  console.log('a user connected');
  gatewaySocket = socket;

  socket.on("discovery", function(deviceId) {
    console.log("New device");
    console.log(deviceId);

    devices[devices.length] = {
      deviceId: deviceId,
      attrs: []
    };

  });
  socket.on("get response", function(getResponse) {
    console.log("Get response");
    console.log(getResponse);

    ledResource.uri = getResponse.uri;
    ledResource.power = getResponse.power;
    ledResource.state = getResponse.state;
  });
});

//Server ========================================================= 
http.listen(port, function() {
    console.log('Listenning on port: ' + port);
});
