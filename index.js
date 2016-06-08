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
    res.render('index.html', { devices });
});

app.get('/getResources', function(req, res) {
    console.log("getResources");
    for(var i=0; i < devices.length; i++) {
      // if(devices[i].id === "coap://[fe80::b5ff:4b82:377a:862b]:38582/a/led")
      gatewaySocket.emit("get", {identifier: devices[i].id} );
    }
    res.redirect('../');
});

app.get('/discovery', function(req, res) {
    devices = [];
    gatewaySocket.emit("discovery");
    res.redirect('../');
});

app.get('/clear', function(req, res) {
    console.log("clear");
    devices = [];
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

  socket.emit("discovery");

  socket.on("discovery response", function(deviceId) {
    console.log("New device");
    console.log(deviceId);

    devices[devices.length] = {
      id: deviceId,
      attrs: []
    };

  });
  socket.on("get response", function(resp) {
    console.log("Get response");
    console.log(resp);

    for(var i=0; i < devices.length; i++) {
      if(devices[i].id === resp.id) {
        devices[i].attrs = resp.attrs.slice(0);
        break;
      }
    }
  });
});

//Server ========================================================= 
http.listen(port, function() {
    console.log('Listenning on port: ' + port);
});
