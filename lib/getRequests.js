var Userschema = require('./models/mongoSchema.js');
var Newsschema = require('./models/newsMongoSchema.js');
var redis = require('redis');
var redisClient = redis.createClient();
var customFunctions = require('./customfunctions');
	var writeLog = customFunctions.writeLog;
	var getPercentage = customFunctions.getPercentage;
/*functions  of get requests's callbacks*/

var getComments = function(req, res){
	var isModeratorView = (req.query.moderatorQuery == 1) ? true : false; 
	var newsID = req.query.newsID;
	var data = {
		comments: []
	};
	try {
		console.log('newsCommentsNeeded');
		Newsschema.findOne({_id: newsID}, 'comments', function(err, rep){
			if (rep !== null && rep !== undefined && rep.comments !== undefined && rep.comments.length !== 0) {
				var commentCounter = 0;
				rep.comments.forEach(function(comment){
					console.log(comment);
					comment.isModeratorView = isModeratorView;
					comment.commentCount = commentCounter;
					comment.id = newsID;
					data.comments.push(comment);
					commentCounter++;
				});
				res.render('comments', data);
			} else {
				res.render('nocomments');
			}
		});
	} catch(e) {
		writeLog(e);
	}
};



var getNews = function(req, res){
	var newsCounter = req.query.counter;
	var isEditorView = (req.query.editorQuery == 1) ? true : false; 
	var data = {
		news: []
	};
	try {
		console.log('newsneeded');
		Newsschema.find({}, 'title body likes img date').skip(newsCounter).limit(5).sort({_id: -1}).exec(function(err, news){
			console.log(news);
			news.forEach(function(oneNews){
				oneNews.isEditorView = isEditorView;
				data.news.push(oneNews);
			});
			res.render('news', data);
		});
	} catch(e) {
		writeLog(e);
	}
};


var getProposes = function(req, res){
	var isModeratorView = (req.query.moderatorQuery == 1) ? true : false; 
	var data = {
		propose: []
	};
	try {
			console.log("propose Needed");
			redisClient.srandmember('proposalData', 10, function(err, reps){
				reps.forEach(function(rep){
					var proposeKey = 'proposeKey' + rep;
					redisClient.hgetall(proposeKey, function(err, reply){
						if (reply != null) {
							reply.isModeratorView = isModeratorView;
							data.propose.push(reply);
						}
					});
				});
				console.log('sending proposes...');
				res.render('propose', data);
			});
		} catch(e) {
			writeLog(e);
		}
};


var getMessages = function(req, res){
	var messageCounter = req.query.counter;
	var isModeratorView = (req.query.moderatorQuery == 1) ? true : false; 
	var data = {
		message: []
	};
	try {
			console.log("message needed");
			redisClient.lrange('messageIDs', messageCounter, messageCounter + 10, function(err, reps){
				if(reps !== null && reps !== undefined) {
					reps.forEach(function(rep){
						redisClient.hgetall('messageByID' + rep, function(err, rep2){
							if (rep2 !== null) {
								rep2.isModeratorView = isModeratorView;
								rep2.messageID = rep;
								data.message.push(rep2);
							}
						});
					});
					console.log('sending messages...');
					res.render('message', data);
				}
			});	
		} catch(e) {
			writeLog(e);
		}
};

var getBanlist = function(req, res){
	var page = req.query.page;
	var data={
		login: []
	};
	console.log('banListNeeded');
		try {
			redisClient.smembers('banList', function(err, reps){
					var start = page * 10 - 10; /*10 persons per page*/
					var end = page * 10;
					var repsToSend = reps.slice(start, end);
					data.login = repsToSend;
					console.log(data);
					res.render('banlist', data);
			});
		} catch(e) {
			writeLog(e);
		}
};

var searchBanned = function(req, res){
	var login = req.query.login;
	var data={
		login: []
	};
	try {
		var dataToFind = login.toUpperCase();
		redisClient.sismember('banList', dataToFind, function(err, rep2) {
			if(rep2 === 1) {
				Userschema.findOne({loginUpperCase: dataToFind}, 'login', function(err, rep3){
					if (rep3 !== null) {
						data.login.push(rep3.login);
						res.render('banlist', data);
					}
				});
			} else {
				res.render('nobanned');
			}
		});
	} catch(e) {
		writeLog(e);
	}
};

var getVotes = function(req, res){
	var login = req.query.login;
	redisClient.sismember('votedLogin', login, function(err, rep){
		if (rep === 1) {
			redisClient.hgetall('voteCandidates', function(err, rep2){
				if (rep2 !== undefined) {
					var votes = getPercentage(rep2.candidate001, rep2.candidate002, rep2.candidate003);
					if (votes) {
						var data = {
							percV1: votes[0],
							percV2: votes[1],
							percV3: votes[2],
							first: rep2.first,
							second: rep2.second,
							third: rep2.third
						};
						console.log(data);
						res.render('voteresult', data);
					}
				}
			});
		} else {
			redisClient.hgetall('voteCandidates', function(err, rep2){
				res.render('voteform', rep2);
			});
		}
	});	
}

module.exports.getVotes = getVotes;
module.exports.searchBanned = searchBanned;
module.exports.getBanlist = getBanlist;
module.exports.getComments = getComments;
module.exports.getNews = getNews;
module.exports.getProposes = getProposes;
module.exports.getMessages = getMessages;

