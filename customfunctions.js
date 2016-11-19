var fs = require('fs-extra');
var redis = require('redis');
var redisClient = redis.createClient();
var https = require('https');
var formidable = require('formidable');
var easyimg = require('easyimage');
/*функции проверки пользователя*/
var simpleVerificate = function (login, session,callback){
	var reply;
	var userDataKey = 'userKey' + login.toUpperCase();
	redisClient.hget('session', session, function(err, rep){
		if (rep == userDataKey) {
			console.log('verificate ok');
			reply = true;
			callback(reply);
		} else {
			console.log('no verificate');
			reply = false;
			callback(reply);
		}
	});
};

var verificate = function (login, session, isMighty, callback) { /*верификация сесии с проверками прав*/
	var reply;
	var userDataKey = 'userKey' + login.toUpperCase();
	redisClient.hget('session', session, function(err, rep){
		if (rep == userDataKey) {
			redisClient.hget(userDataKey, isMighty, function(err, rep2){
				if (rep2 == 'true') {
					console.log('proceeding');
					reply = true;
					callback(reply);
				} else {
					console.log('no rights');
					reply = false;
					callback(reply);
				}
			});
		} else {
			console.log('no verificate');
			reply = false;
			callback(reply);
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
	var serverLog = __dirname + '/serverlog.txt';
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
			form.uploadDir =__dirname + '/public/avatars';
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
				var avatarLogin = fields.login;
				var session = fields.session;
				simpleVerificate(avatarLogin, session, function(rep){
						if (rep) {
						console.log(avatarLogin);
						var fileName = __dirname + '/public/avatars/' + avatarLogin + '.jpeg';
					/*переименовываем имя файла картинки согласно схеме - имя пользвателя*/
						try {
						fs.stat(files.upload.path, function(err, stats){
							console.log(stats.size);
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
	var form = new formidable.IncomingForm();
			form.uploadDir =__dirname + '/public/images';
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
					var newsLogin = fields.login;
					var session = fields.session;
					verificate(newsLogin, session, 'isEditor', function(rep) {
						if (rep) {
							var fileName = __dirname + '/public/images/newsID-' + newsDate;
							redisClient.incr('currentNewsID', function(err, newsID){
								var fileNameKey = 'newsKey' + newsDate + newsID; /*Сохраняем переменную как уникальный ключ для конкретной новости*/
								redisClient.lpush('newsTitles', fileNameKey); /*сохраняем уникальны ключ новости в архив, чтоб потом по запросы выводить их все*/
								redisClient.hset(fileNameKey, 'title', newsTitle); /*сохраняем новость по уникальному ключу*/
								redisClient.hset(fileNameKey, 'body', newsBody);
								redisClient.hset(fileNameKey, 'date', newsDate);
								redisClient.hset(fileNameKey, 'newskey', fileNameKey);
								easyimg.resize({src: files.upload.path, dst: fileName + newsID + '.jpeg', width:600, height:600}, function(err, stdout, stderr) { /*resize and переименовываем имя файла картинки согласно схеме - дата + заголоовк новостиё*/
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
														var fileNameForHTML = '/images/newsID-' + newsDate + newsID + '.jpeg'; /*Сохраняем имя файла картинки в том виде, в каком потом вставим в html*/
														redisClient.hset(fileNameKey, 'img', fileNameForHTML);
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
				console.log(e);
				writeLog(e);
			}
			res.redirect('/');
};

var registerMe = function(req, res){
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
										var userDataKey = 'userKey' + loginKey; /*создаем ключ для базы пльзовательских данных*/
										redisClient.sadd(['originalEmails', req.body['email']], function(err, rep2){ /*Email не занят, т.е. еще не присутствует в массиве оригинальных логинов*/
											if (rep2 == 1) {
												redisClient.hset(userDataKey, 'login', login); /*пишем пользовательские данные по ключу*/
												redisClient.hset(userDataKey, 'password', req.body['password']);
												redisClient.hset(userDataKey, 'email', req.body['email']);
												redisClient.hset(userDataKey, 'isModerator', false);
												redisClient.hset(userDataKey, 'isBanned', false);
												redisClient.hset(userDataKey, 'isEditor', false);
												redisClient.hset(userDataKey, 'activity', 0);
												redisClient.hset('userEmail', req.body['email'], userDataKey);			
												fs.copy(__dirname + '/public/avatars/no-ava-1.jpeg', __dirname + '/public/avatars/' + login + '.jpeg');
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
								res.end("Login is unvalid. Login shouldnt contain symbols: \" \'");
							}
					} else {
							res.end("Captcha failed, sorry.");
							// TODO: take them back to the previous page
							// and for the love of everyone, restore their inputs
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
