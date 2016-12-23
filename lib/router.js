var fs = require('fs-extra');
var customFunctions = require('./customfunctions');
	var writeLog = customFunctions.writeLog;
	var uploadAvatar = customFunctions.uploadAvatar;
	var uploadNews = customFunctions.uploadNews;
	var registerMe = customFunctions.registerMe;
	var getMessages = customFunctions.getMessages;
	var getProposes = customFunctions.getProposes;
	
var getRequests = [
	{
		url: '/',
		callback: function(req, res) {
			res.sendFile(__dirname + '/html/index.html');
		}
	},
	{
		url: /\/[a-z0-9]/,
		callback: function(req, res, next){    /*сделал через регулярку, т.к. имена файлов совпадают с именем запроса*/
			try {
				var pathname = __dirname + '/views/' + req.url + '.html';
				fs.exists(pathname, function(exists){
					try {
						if (exists) res.sendFile(__dirname + '/views/' + req.url + '.html');
						else next();
					} catch(e) {
						writeLog(e);
					}
				});
			} catch(e) {
				writeLog(e);
			}
		}
	},
	{
		url: '/getmessages',
		callback: getMessages
	},
	{
		url: '/getproposes',
		callback: getProposes
	}
];
var postRequests = [
	{
		url: '/upload',
		callback: uploadNews
	},
	{
		url: '/uploadavatar', 
		callback: uploadAvatar
	},
	{
		url: '/registerme',
		callback: registerMe
	}
];

var router = function (app) {
	getRequests.forEach(function(request){
		app.get(request.url, request.callback);
	});
	postRequests.forEach(function(request){
		app.post(request.url, request.callback)
	});
};

module.exports.router = router;