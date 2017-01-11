var redis = require('redis');
var redisClient = redis.createClient();
var crypto = require('crypto');
var customFunctions = require('./customfunctions');
	var writeLog = customFunctions.writeLog;
	var getRandomInt = customFunctions.getRandomInt;
	var formatDate = customFunctions.formatDate;
	var verificate = customFunctions.verificate;
	var simpleVerificate = customFunctions.simpleVerificate;
	var checkPropose = customFunctions.checkPropose;
var Userschema = require('./models/mongoSchema.js');
var Newsschema = require('./models/newsMongoSchema.js');
var secret = require('./credentials.js');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
	secure: true, // use SSL
    auth: {
        user: secret.email,
        pass: secret.pass
    }
};
var transporter = nodemailer.createTransport(smtpTransport(smtpConfig));


 var socketioRequests  = function (client, scServer) {
	 try {
		console.log("Client connected...");
		
		 /*Начало блока новостей*/ 
		  
		client.on('deleteNews', function(data){ /*Удаление новости*/
			try {
				verificate(data, 'isEditor', function(rep){
					if (rep) Newsschema.remove({_id: data.newsID}).exec();
				});
			} catch(e) {
				writeLog(e);
			}	
		});

	client.on('likeNews', function(data){
		try {
			simpleVerificate(data, function(rep){
				if (rep) {
					Newsschema.update({_id: data.newsID}, {$addToSet: {likedOnes: data._id}}).exec(function(err, rep2){
						console.log(rep2);
						Newsschema.findOne({_id: data.newsID}, 'likedOnes', function(err2, rep3){
							if (rep3 !== null) {
								console.log(rep3);
								var likesNew = rep3.likedOnes.length;
								data.likesNew = likesNew;
								console.log(likesNew);
								Newsschema.update({_id: data.newsID}, {$set: {likes: likesNew}}).exec(function(err, rep3){
									client.emit('newNewsLike', data);
								});
							}
						});
					});
				} 
			});
		} catch(e) {
			writeLog(e);
		}	
	});
		
	client.on('newCommentUpload', function(data){
		try {
			if (data.comment !== '') {
				simpleVerificate(data, function(rep){
					if(rep) {
						try {
							var comment = {login: data.login, comment: data.comment, isAvailable: true};
							Newsschema.update({_id: data._newsID}, {$push: {comments: comment}}).exec();
						} catch(e) {writeLog(e);}
					}
				});
			}
		} catch(e) { writeLog(e);}
	});
	
	client.on('deleteComment', function(data){
		try {
			console.log('deleteData:/n' + data._newsID + ' ' + data.commentCount);
			verificate(data, 'isModerator', function(rep){
				if(rep) {
					var position = data.commentCount;
					Newsschema.findOne({_id: data._newsID}, 'comments', function(err, rep2){
						if(rep2 !== null) {
							rep2.comments[position].isAvailable = false;
							rep2.markModified('comments')
							rep2.save();
						}
					});
				}
			});
		} catch(e) {writeLog(e);}
	});
	
	
	/*Конец блока новостей*/
	
	/*Начало блока по предложкам*/
	
	client.on('proposePlused', function(data){ /*клиент плюсанул предложку*/
		try {
			console.log("propose plused");
			simpleVerificate(data, function(reply){
				if(reply) {
					var proposePlusKey = 'proposePlusKey' + data.propose.toUpperCase();
					var proposeKey = 'proposeKey' + data.propose.toUpperCase();
					redisClient.sadd([proposePlusKey, data._id], function(err, rep){ /*список уникальных элементов - т.е. чтобы не повторялся давжды один и тот же проголосовавший логин. ключ списка - само содержание предложки*/
						console.log(rep);
						if (rep == 1) { /*ответ на добавление в списко логина = 1, что значит что логина в списке не было и он успешно добавлен*/
							redisClient.hincrby(proposeKey, 'like', 1, function(err, rep){
								redisClient.hget(proposeKey, 'like', function(err, likes){
									data.likes = likes;
									client.emit('newPlus', data);
								});
							});
							Userschema.update({_id: data._id}, {$inc: {activity: 1}}).exec();
						}
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});	
		
	client.on('proposeUpload', function(data){ /*клиент отправил предложку*/
		try {
			console.log("propose Uploaded");
			simpleVerificate(data, function(reply){
				if(reply) {
					checkPropose(data, function(reply2){
						if(reply2) {
							var proposeStraight = data.propose1 + " VS " + data.propose2;
							var proposeKey = 'proposeKey' + proposeStraight.toUpperCase();
							redisClient.hset(proposeKey, 'propose', proposeStraight);
							redisClient.hset(proposeKey, 'login', data.login);
							redisClient.hset(proposeKey, 'like', 0);
							redisClient.sadd('proposalData', proposeStraight.toUpperCase());
						}
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('deletePropose', function(data){ /*Удалить предложку*/
		try {
			verificate(data, 'isModerator', function(rep){
				if (rep) {
					redisClient.srem(['proposalData', data.propose.toUpperCase()], function(err, rep){
						console.log(rep);
					});
					var proposePlusKey = 'proposePlusKey' + data.propose.toUpperCase();
					var proposeKey = 'proposeKey' + data.propose.toUpperCase();
					redisClient.del(proposePlusKey);
					redisClient.hget(proposeKey, 'proposeOpposite', function(err, rep){
						if (rep != null) {
							redisClient.srem(['proposalData', rep], function(err, rep2){
								redisClient.del(proposeKey);
							});
						} else {
							redisClient.del(proposeKey);
						}
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('clearPropose', function(data){
		try {
			verificate(data, 'isEditor', function(rep){
				if (rep) {
					redisClient.smembers('proposalData', function(err, reps){
						reps.forEach(function(rep){
							var proposePlusKey = 'proposePlusKey' + rep;
							var proposeKey = 'proposeKey' + rep;
							redisClient.del(proposePlusKey);
							redisClient.del(proposeKey);
						});
						redisClient.del('proposalData');
						writeLog(data.login + " cleared PROPOSE");
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	/*Конец блока по предложкам*/
	
	/*начало блока по голосованию*/
	
	client.on('vote', function(data){ /*клиент проголосовал*/
		try {
			simpleVerificate(data, function(reply){
				if (reply) {
					console.log("vote received " + data.votedLogin + " " + data.vote);
					redisClient.sadd(['votedLogin', data.votedLogin], function(err, resp){
						if(resp !== 0 && data.vote !== undefined && data.vote !== null) {
							if (data.vote == '001' || data.vote == '002' || data.vote == '003' ) {
								var vote = 'candidate' + data.vote;
								redisClient.hincrby('voteCandidates', vote, 1);
							}
							Userschema.update({_id: data._id}, {$inc: {activity: 3}}).exec(); 
						}
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('clearvote', function(data){
			try {
				verificate(data, 'isEditor', function(rep){
					if (rep) {
						redisClient.del('votedLogin');
						redisClient.hset('voteCandidates', 'candidate001', 0);
						redisClient.hset('voteCandidates', 'candidate002', 0);
						redisClient.hset('voteCandidates', 'candidate003', 0);
						writeLog(data.login + " cleared VOTE");
					}	
				});
			} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('changeVote', function(data){
		try {
		verificate(data, 'isEditor', function(rep){
				if (rep) {
					redisClient.hset('voteCandidates', 'first', data.first);
					redisClient.hset('voteCandidates', 'second', data.second);
					redisClient.hset('voteCandidates', 'third', data.third);
					redisClient.hset('voteCandidates', 'candidate001', 0);
					redisClient.hset('voteCandidates', 'candidate002', 0);
					redisClient.hset('voteCandidates', 'candidate003', 0);
					writeLog(data.login + " changed VOTE");
				}	
			});
		} catch(e) {
			writeLog(e);
		}	
	});
	
	/*конец блока по голосованию*/
	
	/*Начало блока по сообщениям*/	

	client.on('messageSent', function(data){ /*клиент отправил сообщение в ленту*/
		try {
			console.log("message received");
			simpleVerificate(data, function(reply){
				if(reply) {
					if (!(data.message === '')) { /*проверяем чтоб не отправили пустышку*/
						var messager = data._id;
						if(data.message.length < 250) {
							redisClient.incr('currentMessageID', function(err, messageID){
								redisClient.lpush(['messageIDs', messageID], function(err, rep3){
									console.log("message saved");
									var messageByID = 'messageByID' + messageID;
									data.messageByID = messageByID;
									scServer.global.publish('yell', data);
									redisClient.hset(messageByID, 'messageNick', data.messageNick);
									redisClient.hset(messageByID, 'message', data.message);
									redisClient.hset(messageByID, '_id', data._id);
									redisClient.hset(messageByID, 'avatarUrl', data.avatarUrl);
									Userschema.update({_id: messager}, {$inc: {activity: 1}}).exec(); /*увеличиваем активность пользователя отправившего сообщение*/
									if (rep3 > 100) {
										redisClient.rpop('messageIDs', function(err, rep4){
											var messageByIDToDel = 'messageByID' + rep4;
											redisClient.del(messageByIDToDel);
										});
									}
								});
							});
						}
					}
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('deleteMessage', function(data){ /*команда на удаление сообщения*/
		try {
			verificate(data, 'isModerator', function(rep1){
				if (rep1) {
					redisClient.lrem(['messageIDs', 0, data.messageID], function(err, rep){
						console.log(rep);
						var messageByIDToDel = 'messageByID' + data.messageID;
						redisClient.del(messageByIDToDel, function(err, rep2){
							console.log(rep2);
						});
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	/*Конец блока по сообщениям*/
	
	/*Начало блока по пользовательским данным*/

	client.on('logoff', function(data){
		try {
			Userschema.update({session: data}, {$set: {session: 0}}).exec();
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('getData', function(data){
		try {
			Userschema.findOne({session: data}, function(err, rep){ /*ищем нужную сессию - к ней привязан ключ юзера*/
				console.log(rep);
				if (rep != null) {
					client.emit('takeData', rep);
				} else {
					client.emit('invalidSession');
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('checkEmail', function(data){
		redisClient.sismember(['originalEmails', data], function(err, rep){
			if (rep == 1) {
				client.emit('emailIsInavailable');
			} else {
				client.emit('emailIsAvailable');
			}
		});
	});
	
	
	client.on('checkLogin', function(data){
		redisClient.sismember(['originalLogins', data], function(err, rep){
			if (rep == 1) {
				client.emit('loginIsInavailable');
			} else {
				client.emit('loginIsAvailable');
			}
		});
	});
	
	client.on('login', function(data){ /*клиент пытается войти в систему*/
		try {
			console.log('logging in...');
			console.log(data);
			var loginToEnter = "@" + data.login.toUpperCase();
			var passwordToEnter = data.passwd;
			Userschema.findOne({loginUpperCase: loginToEnter}, 'password', function(err, reply){
				if (reply !== null) {
					if(passwordToEnter == reply.password){ /*данные введенные клиентом есть в массиве логин-паролей*/
					var sessionItem;
					sessionItem = getRandomInt(1, 100000);
					sessionItem = loginToEnter + sessionItem;
					var hashSession = crypto.createHmac('sha256', secret.secret)
											.update(sessionItem)
											.digest('hex');
					Userschema.update({loginUpperCase: loginToEnter}, {$set: {session: hashSession}}, function(err, rep){
						client.emit('loginSuccess', hashSession);
					});
					} else { /*клиент ввел данные не соответствубщие логинов-паролей*/
						console.log('wrong user data');
						client.emit('loginFailed');
					}
				} else { /*клиент ввел данные не соответствубщие логинов-паролей*/
						console.log('wrong user data');
						client.emit('loginFailed');
				}		
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('makeEditor', function(data){
		try {
			console.log(data);
			verificate(data, 'isModerator', function(rep1){
				if (rep1) {
					var editor = '@' + data.editorName.toUpperCase();
					Userschema.findOne({loginUpperCase: editor}, 'isEditor login', function(err, rep){
						if (rep !== null) {
							if (rep.isEditor == false) {
								Userschema.update({loginUpperCase: editor}, {$set: {isEditor: true}}, function(err, rep2){
									client.emit('editorAdded', rep.login);
									writeLog(data._id + " made " + rep.login + " an EDITOR");
								});
							} else {
								Userschema.update({loginUpperCase: editor}, {$set: {isEditor: false}}, function(err, rep2){
									client.emit('editorRemoved', rep.login);
									writeLog(data._id + " made @" + rep.login + " an EDITOR");
								});
							}
						}
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('makeModerator', function(data){
		try {
			verificate(data, 'isModerator', function(rep1){
				if(rep1) {
					var moderator = '@' + data.moderatorName.toUpperCase();
					Userschema.findOne({loginUpperCase: moderator}, 'isModerator login', function(err, rep){
						if (rep !== null) {
							if (rep.isModerator == false) {
								Userschema.update({loginUpperCase: moderator}, {$set: {isModerator: true}}, function(err, rep2){
									client.emit('moderatorAdded', rep.login);
									writeLog(data._id + " made" + rep.login + " MODERATOR");
								});
							} else {
								Userschema.update({loginUpperCase: moderator}, {$set: {isModerator: false}}, function(err, rep2){
									client.emit('moderatorRemoved', rep.login);
									writeLog(data._id + " made" + rep.login + " MODERATOR");
								});
							}
						}
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('banAuthor', function(data){ /*по команде бан меняем значение в хэшмапе пользователя на противоположное*/
		try {
			console.log(data);
			verificate(data, 'isModerator', function(rep1){
				if (rep1) {
					var banNick = data.messageNickToBan.toUpperCase();
					Userschema.findOne({loginUpperCase: banNick}, 'isBanned login', function(err, rep){
						if (rep !== null) {
							if (rep.isBanned == false) {
								Userschema.update({loginUpperCase: banNick}, {$set: {isBanned: true}}, function(err, rep2){
									client.emit('banSuccess', rep.login);
									scServer.global.publish('banRealTime', rep.login);
									redisClient.sadd('banList', banNick);
									writeLog(data._id + " banned " + rep.login);
								});
							} else {
								Userschema.update({loginUpperCase: banNick}, {$set: {isBanned: false}}, function(err, rep2){
									client.emit('banCancel', rep.login);
									scServer.global.publish('banCancelRealTime', rep.login);
									redisClient.srem('banList', banNick);
									writeLog(data._id + " unbanned " + rep.login);
								});
							}
						}
					});
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('banListPaginationNeeded', function(){
		try {
			 redisClient.scard('banList', function(err, rep){
				console.log('cardinality - ' + rep);
				client.emit('banListCardinality', rep);
			});
		} catch(e) {
			writeLog(e);
		}
	});
		
	
	client.on("changeUserEmail", function(data){
		try {
			simpleVerificate(data, function(reply){
				if(reply) {
					Userschema.update({_id: data._id}, {$set: {email: data.email}}, function(err, rep){
						if (err) {client.emit('changeUserdataFailed');}
						client.emit('changeUserDataSuccess');
					});
				} else {
					client.emit('changeUserdataFailed');
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	
	client.on('changeUserData', function(data){
		try {
			console.log(data);
			simpleVerificate(data, function(rep){
				if(rep) {
					Userschema.findOne({_id: data._id}, 'password', function(err, reply){
						if (reply !== null) {
							if(data.pass == reply.password){ /*данные введенные клиентом есть в массиве логин-паролей*/
								Userschema.update({_id: data._id}, {$set: {password: data.newpass}}, function(err, rep){
									client.emit('changeUserDataSuccess'); 	/*отправление данных пользователя в формате объекта*/
								});	
							} else { /*клиент ввел данные не соответствубщие логинов-паролей*/
								client.emit('changeUserdataFailed');
							}	
						}
					});	
				} else {
					client.emit('changeUserdataFailed');
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('forgotLogin', function(data){
		try {
			var userDataKey = '@' + data.forgotLogin.toUpperCase();
			console.log(userDataKey);
			Userschema.findOne({loginUpperCase: userDataKey}, 'email password', function(err, rep){
				if (rep !== null) {
					console.log(rep.email);
					console.log(rep.password);
						var mailOptions = {
							from: 'versus@club.ru', // sender address
							to: rep.email, // list of receivers
							subject: 'VERSUS-CLUB restore', // Subject line
							text: 'Твой пароль', // plaintext body
							html: '<b>Твой пароль: ' + rep.password + '</b>' // html body
						};
						transporter.sendMail(mailOptions, function(error, info){
							if(error){
								console.log(rep.email);
								client.emit('emailSendFail');
								return console.log(error);
							}
								console.log('Message sent: ' + info.response);
								client.emit('checkYouEmail');
						});
				}	
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('forgotEmail', function(data){
		try {
			console.log(data.forgotEmail);
			Userschema.findOne({email: data.forgotEmail}, 'login password', function(err, rep2){
				if(rep2 != null) {
						var loginToSend = rep.login;
							var passToSend = rep2.password;
							var mailOptions = {
								from: 'versus', // sender address
								to: data.forgotEmail, // list of receivers
								subject: 'VERSUS-CLUB restore', // Subject line
								text: 'Твой логин и пароль', // plaintext body
								html: '<b>Твой логин: ' + loginToSend + '</b><br><b>Твой пароль: ' + passToSend + '</b>' // html body
					};
					transporter.sendMail(mailOptions, function(error, info){
						if(error){
							console.log(mail);
							client.emit('emailSendFail');
							return console.log(error);
						}
							console.log('Message sent: ' + info.response);
							client.emit('checkYouEmail');
					});
				} else {
					client.emit('emailSendFail');
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	/*Конец блока по пользовательским данным*/
	} catch(e) {
		writeLog(e);
	}
 };


module.exports.socketioRequests = socketioRequests;