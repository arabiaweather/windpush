var restify = require('restify');
var colors = require('colors'); // add colors for fun
var sys = require("sys");
var cp = require('child_process');

var config = require('konphyg')(__dirname + '/config');
var conf = config('main');

var history = {};

sys.puts("Rest Server Started and Setting up".blue);



//SETUP REST SERVER// 
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
if(conf.allowJSONP){
	server.use(restify.jsonp());
	sys.puts("REST Server JSONP Active".blue);
}
server.use(restify.queryParser());
server.use(restify.authorizationParser());
if(conf.allowCORS){
	server.use(restify.CORS());
	sys.puts("REST Server CORS Active".blue);
}
if(conf.allowPreflight)
{
	var preflight = require('se7ensky-restify-preflight');
	preflight(server);
	sys.puts("REST Server Preflight Active".blue);
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
sys.puts("REST Server Routes Declared".blue);

var socketServer;
//START SERVER ON PORT WITH SOCKET SERVER READY//
server.listen(conf.port, function() {
	console.log('REST %s Server listening at %s', "Windpush", server.url);
	sys.puts("----------------------------------------".blue);
	sys.puts("Starting Socket.IO Server".yellow);
	socketServer = cp.fork(__dirname + '/socketServer.js');
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
//TODO: Change to send to child Socket IO Server 
//	io.sockets.emit(req.body.data.id,req.body);
socketServer.send({id:req.body.data.id, body:req.body});
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

	//history[req.params.id] = null;
	delete history[req.params.id];
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
	if(user == conf.auth.username && pass== conf.auth.password)
	{
		return true;
	}
	else
	{
		return false;
	}
}



