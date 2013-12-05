//DECLARE SOCKET SERVER AND PUSH LAST DATA SENT//
var config = require('konphyg')(__dirname + '/config');
var conf = config('main');

var colors = require('colors');
var sys = require("sys");

sys.puts("Socket.IO Server Started".yellow);

sys.puts("Socket.IO Opening Socket".yellow);


var app = require('http').createServer(handler)
	,io = require('socket.io').listen(app, {log: conf.socketLog})
	,fs = require('fs');
app.listen(conf.socketIOPort);

io.sockets.on('connection', function (socket) {
	if(conf.socketLog)
		console.log("New Connection Added");
});

console.log("Socket.IO Windpush Server listening at http://0.0.0.0:"+conf.socketIOPort);

sys.puts("----------------------------------------".yellow);

process.on('message', function(m) {
	if(conf.socketLog)
		console.log('Broadcasting...',m);
	io.sockets.emit(m.id,m.body);	
});


function handler (req, res) {
    res.writeHead(200);
    res.end();
  };

