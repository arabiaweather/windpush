//TODO: Validate packet structure 
var config = require('konphyg')(__dirname + '/config');
var restify = require('restify');
var history = {};


var sys = require('sys');
var asciimo = require('asciimo').Figlet;
var colors = require('colors'); // add colors for fun

var font = 'Ogre';
var welcome = "== Windpush ==";
asciimo.write(welcome,font,function(art){
        sys.puts(art.white);
});


//Configuration Read//
var conf = config('main');
// Allow preflight 
sys.puts(("Allow CORS -- " + conf.allowCORS).white);
sys.puts(("Allow Prefllight -- " + conf.allowPreflight).white);
sys.puts(("AllowJSONP -- " + conf.allowJSONP).white);



//SETUP REST SERVER// 
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
if(conf.allowJSONP){
	server.use(restify.jsonp());
	console.log("JSONP Active");
}
server.use(restify.queryParser());
server.use(restify.authorizationParser());
if(conf.allowCORS){
	server.use(restify.CORS());
	console.log("CORS Active");
}
if(conf.allowPreflight)
{
	var preflight = require('se7ensky-restify-preflight');
	preflight(server);
	console.log("Preflight Active");
}

/////



//DECLARE ROUTES//

server.post("/", function(req, res, next){
	res.send(200,"OK");
});
server.post('/push', pushData);

server.get('/getHistory',getHistoryList);
server.get('/clearHistory', clearAllHistory);
server.get('/delHistory/:id', clearHistoryItem); 
/////


//DECLARE SOCKET SERVER AND PUSH LAST DATA SENT//
var io = require('socket.io').listen(server, { log: conf.socketLog });
io.sockets.on('connection', function (socket) {
	socket.on('cid', function (data) {
	socket.emit(data.cid, {data : history[data.cid]});
	});
});

//START SERVER ON PORT WITH SOCKET SERVER READY//
server.listen(conf.port, function() {
	console.log('%s listening at %s', "Windpush", server.url);
});
///


///DECLARE ALL ROUTE FUNCTIONS////
function pushData(req, res,next)
{
	
	if(!auth(req.authorization.basic.username,req.authorization.basic.password))
	{
		res.send(401);
		return next;
	}
	io.sockets.emit(req.body.data.id,req.body);
	res.send(req.body.data);
	addToHistory(req.body.data.id, req.body.data);
	return next;

}
//


function addToHistory(id, data)
{
	history[id] = data; 	
}

function clearAllHistory(req, res, next)
{
	if(!auth(req.authorization.basic.username,req.authorization.basic.password))
        {
                res.send(401);
                return next;
        }

	history = {};
	res.send(200);
	return next;
}

function clearHistoryItem(req, res, next)
{
	if(!auth(req.authorization.basic.username,req.authorization.basic.password))
        {
                res.send(401);
                return next;
        }

	history[req.params.id] = null;
	res.send(200);
	return next;		
}

function getHistoryList(req, res, next)
{
	if(!auth(req.authorization.basic.username,req.authorization.basic.password))
        {
                res.send(401);
                return next;
        }

	res.send(200,history);
	return next;
}

function auth(user, pass)
{
	if(user == conf.username && pass== conf.password)
	{
		return true;
	}
	else
	{
		return false;
	}
}
