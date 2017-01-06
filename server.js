var express = require('express');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var server = require('http').createServer();

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var redis = require('redis');
var redisClient = redis.createClient();
//var io = require('socket.io')(server);
var socketClusterServer = require('socketcluster-server');

var socketioRequests = require('./lib/socketiorequests').socketioRequests;
var router = require('./lib/router').router;
console.log("Server runs");
		
var scServer = socketClusterServer.attach(server);


server.on('request', app);
		
scServer.on('connection', function(client){
	socketioRequests(client, scServer);
});

router(app);


server.listen(8080);


