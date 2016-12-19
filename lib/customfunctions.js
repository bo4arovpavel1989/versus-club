var fs = require('fs-extra');
var redis = require('redis');
var redisClient = redis.createClient();
var https = require('https');
var formidable = require('formidable');
var easyimg = require('easyimage');
var Userschema = require('./mongoSchema.js');
var Newsschema = require('./newsMongoSchema.js');



/*функции проверки пользователя*/
var checkPropose = function(data, callback){
	var proposeStraight = data.propose1 + " VS " + data.propose2;
	var proposeOpposite = data.propose2 + " VS " + data.propose1;
	if (!(data.propose1 === '' && data.propose2 === '' )) { /*проверяем чтоб не отправили пустышку*/
		var checkProposeSymbol1 = proposeStraight.indexOf('\'');
		var checkProposeSymbol2 = proposeStraight.indexOf('"');
		if (checkProposeSymbol1 == -1 && checkProposeSymbol2 == -1) {
			if (proposeStraight.length < 100) {
				redisClient.sismember(['proposalData', proposeStraight.toUpperCase()], function(err, rep2){
					if (rep2 == 0) {
						redisClient.sismember(['proposalData', proposeOpposite.toUpperCase()], function(err, rep3){
							if (rep3 == 0) {
								callback(true);
							}
						});
					}
				});
			}
		}	
	} 
};



var simpleVerificate = function (id, session,callback){
	var reply;
	Userschema.findOne({_id: id}, 'session isBanned', function (err, person) {
		console.log(person);
		if (person !== null) {
			try {
				if (person.session == session && person.session != 0 && !person.isBanned) {
					console.log('verificate ok');
					reply = true;
					callback(reply);
				} else {
					console.log('no verificate');
					reply = false;
					callback(reply);
				}	
			} catch (e) {}
		}
	});
};

var verificate = function (id, session, isMighty, callback) { /*верификация сесии с проверками прав*/
	var reply;
	Userschema.findOne({_id: id}, 'session isEditor', function (err, person) {
		console.log(person);
			if (person !== null) {
			try {
				if (person.session == session  && person.session != 0) {
					console.log('verificate ok');
					Userschema.findOne({_id: id}, isMighty, function(err, person2){
						if (person2 !== null) {
							if (person2[isMighty] == true) {
								console.log('proceeding');
								reply = true;
								callback(reply);
							} else {
								console.log('no rights');
								reply = false;
								callback(reply);
							}
						}
					});
				} else {
					console.log('no verificate');
					reply = false;
					callback(reply);
				}	
			} catch (e) {}
		}
	});
};

var formatDate = function (date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yy = date.getFullYear() % 100;
  if (yy < 10) yy = '0' + yy;

  return dd + '-' + mm + '-' + yy;
};


var getRandomInt = function (min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var writeLog = function (textToLog) {
	var serverLog = __dirname + '/../serverlog.txt';
	var logDate = new Date();
	var logTime = logDate.getHours() + ':' + logDate.getMinutes() + ':' + logDate.getSeconds();
	var logData =" \r\n" + formatDate(logDate) + " " + logTime + " " + textToLog;
	fs.appendFile(serverLog, logData);
};



/*функция прверки капчи*/
var SECRET = "6LeOgAcUAAAAAPMX-Y48Tk8Njl6vsg9XoAOfQAV6";
var verifyRecaptcha = function (key, callback) {
    https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
        var data = "";
        res.on('data', function (chunk) {
                        data += chunk.toString();
        });
        res.on('end', function() {
            try {
                var parsedData = JSON.parse(data);
                console.log(parsedData);
                callback(parsedData.success);
            } catch (e) {
                callback(false);
            }
        });
    });
};

var uploadAvatar = function(req, res){
			var form = new formidable.IncomingForm();
			form.uploadDir =__dirname + '/../public/avatars';
			form.keepExtensions = false;
			form.type = 'multipart/form-data';
			form.multiples = true;
			form.on('error', function(err) {
				  console.log(err);
			});
			form.on('end', function(fields, files) {
			  console.log('end')
			});
			form.parse(req, function(err, fields, files) {
				if (err) {
					res.redirect('/options');
				}
				var idLogin = fields.id;
				var session = fields.session;
				 console.log(idLogin);
				simpleVerificate(idLogin, session, function(rep){
						console.log(rep);
						if (rep) {
						var fileName = __dirname + '/../public/avatars/' + idLogin + '.jpeg';
					/*переименовываем имя файла картинки согласно схеме - имя пользвателя*/
						try {
						fs.stat(files.upload.path, function(err, stats){
							console.log(1 + stats.size);
							if (stats.size < 100000) {
								console.log('now resizing');
									easyimg.resize({src: files.upload.path, dst: fileName, width:40, height:40}, function(err, stdout, stderr) {
										console.log('wait for resize result');
										if (err) {
											console.log("Error loading avatar");
											throw err;
											fs.unlink(files.upload.path, function(err){
												console.log("Error loading avatar");
											});
										} 
									}).then(
											function(img) {
												console.log('Resized: ' + img.width + ' x ' + img.height);
												Userschema.update({'_id': idLogin}, {$set: {avatarUrl: '/avatars/' + idLogin + '.jpeg'}}).exec();
												fs.unlink(files.upload.path, function(err){
													console.log("Done resizing, source delete");
													res.redirect('/');
												});
											},
											function (err) {
												console.log(err);
												fs.unlink(files.upload.path, function(err){
													console.log("Error resizing, source delete");
												});
											}
									);
							} else {
								fs.unlink(files.upload.path, function(err){
									console.log("Too large avatar");
								});
							}
						});
						} catch(e) {
							console.log(e);
							writeLog(e);
						}
					}
				});	
			});
};

var uploadNews = function(req, res){
			console.log(111);
			var form = new formidable.IncomingForm();
			form.uploadDir =__dirname + '/../public/images';
			form.keepExtensions = false;
			form.type = 'multipart/form-data';
			form.multiples = true;
			form.on('error', function(err) {
				  console.log(err);
			});
			form.on('end', function(fields, files) {
			  console.log('end')
			});
			try {
				form.parse(req, function(err, fields, files) {
					var newsDate = new Date();
					newsDate = formatDate(newsDate);
					var newsTitle = fields.title;
					var newsBody = fields.body;
					var newsAuthorId = fields.id;
					var session = fields.session;
					verificate(newsAuthorId, session, 'isEditor', function(rep) {
						if (rep) {
							redisClient.incr('currentNewsID', function(err, newsID){
								var fileName = __dirname + '/../public/images/news/newsID-' + newsDate + newsID + '.jpeg'; /*сохраняем абсолютный путь файла*/
								var fileNameForHTML = '/images/news/newsID-' + newsDate + newsID + '.jpeg'; /*Сохраняем имя файла картинки в том виде, в каком потом вставим в html*/
								var addNews = new Newsschema({title: newsTitle, body: newsBody, date: newsDate, img: fileNameForHTML});
								addNews.save(function(err, result){
									console.log(result);
								});
								easyimg.resize({src: files.upload.path, dst: fileName, width:600, height:600}, function(err, stdout, stderr) { /*resize and переименовываем имя файла картинки согласно схеме - дата + заголоовк новостиё*/
											console.log('wait for resize result');
											if (err) {
												console.log("Error loading news");
												throw err;
												fs.unlink(files.upload.path, function(err){
													console.log("Error loading news");
												});
											} 
								}).then(
									function(img) {
										console.log('Resized: ' + img.width + ' x ' + img.height);
										fs.unlink(files.upload.path, function(err){
											console.log("Done resizing, source delete");
										});
									},
									function (err) {
										console.log(err);
										fs.unlink(files.upload.path, function(err){
											console.log("Error resizing, source delete");
										});
									}
								);
							});
						}
					});
				});
			} catch(e) {
				writeLog(e);
			}
			res.redirect('/');
};

var registerMe = function(req, res){
							/*потом сюда не забыть вернуть проверку капчи*/
				verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
					if (success) {
							console.log(req.body['login']);
							console.log(req.body['password']);
							console.log(req.body['email']);
							var login = "@" + req.body['login'];
							var checkLoginSymbol1 = login.indexOf('\'');
							var checkLoginSymbol2 = login.indexOf('"');
							if (checkLoginSymbol1 == -1 && checkLoginSymbol2 == -1) {
								var loginKey = "@" + req.body['login'].toUpperCase();
								redisClient.sadd(['originalLogins', loginKey], function(err, rep){
									if (rep == 1) { /*логин не занят, т.е. еще не присутствует в массиве оригинальных логинов*/
										redisClient.sadd(['originalEmails', req.body['email']], function(err, rep2){ /*Email не занят, т.е. еще не присутствует в массиве оригинальных логинов*/
											if (rep2 == 1) {
												var userAdd = new Userschema({loginUpperCase: loginKey, login: login, password: req.body['password'], email: req.body['email']});
												userAdd.save(function(err2, result) {
													if(err2)
														res.end(err2);
													else {
														console.log(result);
													}
												});
													res.redirect('/');
											} else {
													redisClient.srem('originalLogins', loginKey, function(err, rep){
													res.end("E-Mail is not available"); 
												});
											}
										});
										
									} else if (rep == 0) { /*логин уже занят*/
										console.log('login is invalid');
										res.end("Login is not available");
									} 
								});
							} else {
							res.end("Login is unvalid. Login shouldnt contain symbols: \" \'"); }
					
					} else { 
						res.end("Captcha failed, sorry.");	
					}
				});	
};


module.exports.registerMe = registerMe;
module.exports.uploadNews = uploadNews;
module.exports.uploadAvatar = uploadAvatar;
module.exports.verifyRecaptcha = verifyRecaptcha;
module.exports.writeLog = writeLog;
module.exports.getRandomInt = getRandomInt;
module.exports.formatDate = formatDate;
module.exports.verificate = verificate;
module.exports.simpleVerificate = simpleVerificate;
module.exports.checkPropose = checkPropose;
