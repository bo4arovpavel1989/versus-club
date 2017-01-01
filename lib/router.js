var fs = require('fs-extra');
var customFunctions = require('./customfunctions');
	var writeLog = customFunctions.writeLog;
	
var uploadAvatar = require('./postRequests').uploadAvatar;
var uploadNews = require('./postRequests').uploadNews;
var registerMe = require('./postRequests').registerMe;

var getMessages = require('./getRequests').getMessages;
var getProposes = require('./getRequests').getProposes;
var getNews = require('./getRequests').getNews;
var getComments = require('./getRequests').getComments;
var getBanlist = require('./getRequests').getBanlist;
var searchBanned = require('./getRequests').searchBanned;	
	
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
				var pathname = __dirname + '/html/' + req.url + '.html';
				fs.exists(pathname, function(exists){
					try {
						if (exists) res.sendFile(pathname);
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
	},
	{
		url: '/getnews',
		callback: getNews
	},
	{
		url: '/getcomments',
		callback: getComments
	},
	{
		url: '/getbanlist',
		callback: getBanlist
	},
	{
		url: '/searchbanned',
		callback: searchBanned
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