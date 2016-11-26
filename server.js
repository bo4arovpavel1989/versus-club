var express = require('express');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('html', engines.hogan);


var redis = require('redis');
var redisClient = redis.createClient();
var io = require('socket.io')(server);

var socketioRequests = require('./socketiorequests').socketioRequests;
var router = require('./router').router;
console.log("Server runs");
		

io.on('connection', function(client){
	socketioRequests(client);
});

router(app);


server.listen(8080);


