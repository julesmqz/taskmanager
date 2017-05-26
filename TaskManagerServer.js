var restify = require('restify');
var config = require('./config.js');
var s = require('./Classes/ServerClass');

var server = restify.createServer();
server.use(restify.bodyParser());

server.get('/', function(req, res, next) {
	res.send({
		msg: 'Task Manager Rest server working correctly'
	}, 200);
	next();
});

server.get('/startTask/:key/', s.startTask);



server.listen(config.server.port, function() {
	console.log('%s listening at %s', server.name, server.url);
});