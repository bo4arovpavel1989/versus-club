var express = require('express');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
var redis = require('redis');
var redisClient = redis.createClient();
var io = require('socket.io')(server);

var socketioRequests = require('./lib/socketiorequests').socketioRequests;
var router = require('./lib/router').router;
console.log("Server runs");
		

io.on('connection', function(client){
	socketioRequests(client);
});

router(app);


server.listen(8080);


