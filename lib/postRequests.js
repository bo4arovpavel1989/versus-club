var fs = require('fs-extra');
var redis = require('redis');
var redisClient = redis.createClient();
var formidable = require('formidable');
var easyimg = require('easyimage');
var Userschema = require('./models/mongoSchema.js');
var Newsschema = require('./models/newsMongoSchema.js');

var customFunctions = require('./customfunctions');
	var writeLog = customFunctions.writeLog;
	var simpleVerificate = customFunctions.simpleVerificate;
	var verificate = customFunctions.verificate;
	var formatDate = customFunctions.formatDate;
	var verifyRecaptcha = customFunctions.verifyRecaptcha;
	
/*functions  of post requests's callbacks*/

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

