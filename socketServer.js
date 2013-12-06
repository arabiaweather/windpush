//DECLARE SOCKET SERVER AND PUSH LAST DATA SENT//
var config = require('konphyg')(__dirname + '/config');
var conf = config('main');

var colors = require('colors');
var sys = require("sys");
var history = {};

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
		console.log('Recived Data from REST Server',m);
	if( m.type === 'broadcast')
	{
		if(conf.socketLog)
			console.log('Broadcast Message Being Sent');
		io.sockets.emit(m.id,m.body);	
	}

	if(m.type === 'history')
	{
		if(conf.socketLog)
			console.log("Recived New History Package");
		history = m.history;	
	}
});


function handler (req, res) {
    res.writeHead(200);
    res.end(JSON.stringify(history));
  };

