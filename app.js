//TODO: Validate packet structure 
//TODO: Basic Auth from konfyg 
//TODO: Clean Console.log and debugs 
var restify = require('restify');
var history = {};


//SETUP REST SERVER// 
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
server.use(restify.jsonp());
server.use(restify.queryParser());
server.use(restify.authorizationParser());
server.use(restify.CORS());

var preflight = require('se7ensky-restify-preflight');
preflight(server);

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
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
	console.log("Connection....");
	socket.on('cid', function (data) {
	console.log(data.cid);
	socket.emit(data.cid, {data : history[data.cid]});
console.log(history);
	});
});

//START SERVER ON PORT WITH SOCKET SERVER READY//
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
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
	console.log(history);
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
	if(user == 'yousef' && pass== 'wadi')
	{
		return true;
	}
	else
	{
		return false;
	}
}
