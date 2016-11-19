var express = require('express');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('html', engines.hogan);
app.use(cookieParser());

var redis = require('redis');
var redisClient = redis.createClient();
var io = require('socket.io')(server);

var socketioRequests = require('./socketiorequests').socketioRequests;
var router = require('./router').router;
console.log("Server runs");

/*тестовые пользователи*/
redisClient.sadd(['originalLogins', '@123']);
redisClient.sadd(['originalLogins', '@111']);
redisClient.sadd(['originalLogins', '@master']);
redisClient.hset('userKey@MASTER', 'login', "@master");
			redisClient.hset('userKey@MASTER', 'password', 123);
			redisClient.hset('userKey@MASTER', 'email', 'master');
			redisClient.hset('userKey@MASTER', 'isModerator', true);
			redisClient.hset('userKey@MASTER', 'isEditor', true);
			redisClient.hset('userKey@MASTER', 'isBanned', false);
			redisClient.hset('userKey@MASTER', 'activity', 100);
redisClient.hset('userKey@123', 'login', "@123");
			redisClient.hset('userKey@123', 'password', 123);
			redisClient.hset('userKey@123', 'email', 123);
			redisClient.hset('userKey@123', 'isModerator', true);
			redisClient.hset('userKey@123', 'isEditor', true);
			redisClient.hset('userKey@123', 'isBanned', false);
			redisClient.hset('userKey@123', 'activity', 100);

redisClient.hset('userKey@111', 'login', "@111");
			redisClient.hset('userKey@111', 'password', 111);
			redisClient.hset('userKey@111', 'email', 111);
			redisClient.hset('userKey@111', 'isModerator', false);
			redisClient.hset('userKey@111', 'isBanned', true);
			redisClient.hset('userKey@111', 'activity', 0);	
redisClient.sadd('banList', '@111');			

io.on('connection', function(client){
	socketioRequests(client);
});

router(app);


server.listen(8080);


