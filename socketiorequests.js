var redis = require('redis');
var redisClient = redis.createClient();
var customFunctions = require('./customfunctions');
	var writeLog = customFunctions.writeLog;
	var getRandomInt = customFunctions.getRandomInt;
	var formatDate = customFunctions.formatDate;
	var verificate = customFunctions.verificate;
	var simpleVerificate = customFunctions.simpleVerificate;
var Userschema = require('./mongoSchema.js');
var Newsschema = require('./newsMongoSchema.js');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
	secure: true, // use SSL
    auth: {
        user: 'bo4arovpavel1989@gmail.com',
        pass: 'stigmata89'
    }
};
var transporter = nodemailer.createTransport(smtpTransport(smtpConfig));
 var socketioRequests  = function (client) {
	 try {
		console.log("Client connected...");
		
		 /*Начало блока новостей*/ 
		  
		client.on('deleteNews', function(data, data2){ /*Удаление новости*/
			try {
				verificate(data2._id, data2.session, 'isEditor', function(rep){
					if (rep) Newsschema.remove({_id: data}).exec();
				});
			} catch(e) {
				writeLog(e);
			}	
		});
	
	
	client.on('newsNeeded', function(data){ /*клиент просит новости*/
		try {
			console.log('newsneeded');
			Newsschema.find({}, 'title body likes img date').skip(data).limit(5).sort({_id: -1}).exec(function(err, news){
				console.log(news);
				news.forEach(function(oneNews){
					client.emit('newsSend', oneNews);
				});
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('likeNews', function(data, data2){
		try {
			simpleVerificate(data2._id, data2.session, function(rep){
				if (rep) {
					Newsschema.update({_id: data}, {$addToSet: {likedOnes: data2._id}}).exec(function(err, rep2){
						console.log(rep2);
						Newsschema.findOne({_id: data}, 'likedOnes', function(err2, rep3){
							if (rep3 !== null) {
								console.log(rep3);
								var likesNew = rep3.likedOnes.length;
								console.log(likesNew);
								Newsschema.update({_id: data}, {$set: {likes: likesNew}}).exec(function(err, rep3){
									client.emit('newNewsLike', data, likesNew);
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
	
	
	/*Конец блока новостей*/
	
	/*Начало блока по предложкам*/
	
	client.on('proposePlused', function(data){ /*клиент плюсанул предложку*/
		try {
			console.log("propose plused");
			simpleVerificate(data._id, data.session, function(reply){
				if(reply) {
					var proposePlusKey = 'proposePlusKey' + data.propose.toUpperCase();
					var proposeKey = 'proposeKey' + data.propose.toUpperCase();
					redisClient.sadd([proposePlusKey, data._id], function(err, rep){ /*список уникальных элементов - т.е. чтобы не повторялся давжды один и тот же проголосовавший логин. ключ списка - само содержание предложки*/
						console.log(rep);
						if (rep == 1) { /*ответ на добавление в списко логина = 1, что значит что логина в списке не было и он успешно добавлен*/
							redisClient.hincrby(proposeKey, 'like', 1, function(err, rep){
								redisClient.hget(proposeKey, 'like', function(err, likes){
									client.emit('newPlus', data.propose, likes);
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
		
	client.on('proposeNeeded', function(){ /*клиент просит спиок предложек*/
		try {
			console.log("propose Needed");
			redisClient.srandmember('proposalData', 10, function(err, reps){
				reps.forEach(function(rep){
					var proposeKey = 'proposeKey' + rep;
					redisClient.hgetall(proposeKey, function(err, reply){
						if (reply != null) {
							client.emit('proposeSend', reply);
						}
					});
				});
			});
		} catch(e) {
			writeLog(e);
		}
	});			
			
	client.on('proposeUpload', function(data){ /*клиент отправил предложку*/
		try {
			console.log("propose Uploaded");
			simpleVerificate(data._id, data.session, function(reply){
				if(reply) {
					var proposeStraight = data.propose1 + " VS " + data.propose2;
					var proposeOpposite = data.propose2 + " VS " + data.propose1;
					var proposeKey = 'proposeKey' + proposeStraight.toUpperCase();
					if (!(data.propose1 === '' && data.propose2 === '' )) { /*проверяем чтоб не отправили пустышку*/
						var checkProposeSymbol1 = proposeStraight.indexOf('\'');
						var checkProposeSymbol2 = proposeStraight.indexOf('"');
						if (checkProposeSymbol1 == -1 && checkProposeSymbol2 == -1) {
							Userschema.findOne({_id: data._id}, 'isBanned', function(err, rep){
								if (rep !== null) {
									if (rep.isBanned == false && proposeStraight.length < 100) {
										redisClient.sismember(['proposalData', proposeStraight.toUpperCase()], function(err, rep2){
											if (rep2 == 0) {
												redisClient.sismember(['proposalData', proposeOpposite.toUpperCase()], function(err, rep3){
													if (rep3 == 0) {
														redisClient.hset(proposeKey, 'propose', proposeStraight);
														redisClient.hset(proposeKey, 'login', data.login);
														redisClient.hset(proposeKey, 'like', 0);
														redisClient.sadd('proposalData', proposeStraight.toUpperCase());
													}
												});
											}
										});
									}
								}
							});
						}	
					}
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('deletePropose', function(data, data2){ /*Удалить предложку*/
		try {
			verificate(data2._id, data2.session, 'isModerator', function(rep){
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
			verificate(data._id, data.session, 'isEditor', function(rep){
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
	
	client.on('voteDataNeeded', function(data){ /*клиен просит данные по голосованиям*/
		try {
			console.log("voteDataNeeded");
			redisClient.hgetall('voteCandidates', function(err, rep){
				client.emit('voteCandidates', rep);
			});
			redisClient.lrange('vote', 0, -1, function(err, votes){
				client.emit("votesSend", votes);
			});
			redisClient.lrange('votedLogin', 0, -1, function(err, votedLgns){
				client.emit("votedLoginSend", votedLgns);
			});
		} catch(e) {
			writeLog(e);
		}
	});		
	
	client.on('vote', function(data){ /*клиент проголосовал*/
		try {
			simpleVerificate(data._id, data.session, function(reply){
				if (reply) {
					console.log("vote received " + data.votedLogin + " " + data.vote);
					redisClient.lpush(['vote', data.vote], function(err, resp){
					});
					redisClient.lpush(['votedLogin', data.votedLogin], function(err, resp){
					});
					var voter = "userKey" + data.votedLogin.toUpperCase();
					Userschema.update({_id: data._id}, {$inc: {activity: 3}}).exec(); 
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('clearvote', function(data){
			try {
				verificate(data._id, data.session, 'isEditor', function(rep){
					if (rep) {
						redisClient.del('vote');
						redisClient.del('votedLogin');
						writeLog(data.login + " cleared VOTE");
					}	
				});
			} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('changeVote', function(data, data2){
		try {
		verificate(data2._id, data2.session, 'isEditor', function(rep){
				if (rep) {
					redisClient.hset('voteCandidates', 'first', data.first);
					redisClient.hset('voteCandidates', 'second', data.second);
					redisClient.hset('voteCandidates', 'third', data.third);
					writeLog(data2.login + " changed VOTE");
				}	
			});
		} catch(e) {
			writeLog(e);
		}	
	});
	
	/*конец блока по голосованию*/
	
	/*Начало блока по сообщениям*/	
	
	client.on('messageNeeded', function(data){ /*клиент просит данные по ленте сообщений*/
		try {
			console.log("message needed");
			redisClient.lrange('messageIDs', data, data + 10, function(err, reps){
				reps.forEach(function(rep){
					redisClient.hgetall('messageByID' + rep, function(err, rep2){
						client.emit('messageSent', rep2, rep); 
					});
				});
			});	
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('message', function(data, data2){ /*клиент отправил сообщение в ленту*/
		try {
			console.log("message received");
			console.log(data.message === '');
			simpleVerificate(data._id, data2.session, function(reply){
				if(reply) {
					if (!(data.message === '')) { /*проверяем чтоб не отправили пустышку*/
						var messager = data._id;
						Userschema.findOne({_id: messager}, 'isBanned', function(err, rep){
							if (rep !== null) {
								if (rep.isBanned == false) {
									if(data.message.length < 250) {
										redisClient.incr('currentMessageID', function(err, messageID){
												redisClient.lpush(['messageIDs', messageID], function(err, rep3){
													console.log("message saved");
													var messageByID = 'messageByID' + messageID;
													client.broadcast.emit('messageSentRealTime', data, messageID); 
													client.emit('messageSentRealTime', data, messageID); 
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
					}
				}
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('deleteMessage', function(data, data2){ /*команда на удаление сообщения*/
		try {
			console.log(data + 'is about to delete');
			verificate(data2._id, data2.session, 'isModerator', function(rep1){
				if (rep1) {
						redisClient.lrem(['messageIDs', 0, data], function(err, rep){
						console.log(rep);
						var messageByIDToDel = 'messageByID' + data;
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
			Userschema.update({_id: data}, {$set: {session: 0}}).exec();
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
					Userschema.update({loginUpperCase: loginToEnter}, {$set: {session: sessionItem}}, function(err, rep){
						client.emit('loginSuccess', sessionItem);
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
	
	client.on('makeEditor', function(data, data2){
		try {
			console.log(data2);
			verificate(data2._id, data2.session, 'isModerator', function(rep1){
				if (rep1) {
					data = '@' + data.toUpperCase();
					Userschema.findOne({loginUpperCase: data}, 'isEditor login', function(err, rep){
						if (rep !== null) {
							if (rep.isEditor == false) {
								Userschema.update({loginUpperCase: data}, {$set: {isEditor: true}}, function(err, rep2){
									client.emit('editorAdded', rep.login);
									writeLog(data2._id + " made " + rep.login + " an EDITOR");
								});
							} else {
								Userschema.update({loginUpperCase: data}, {$set: {isEditor: false}}, function(err, rep2){
									client.emit('editorRemoved', rep.login);
									writeLog(data2._id + " made @" + rep.login + " an EDITOR");
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
	
	client.on('makeModerator', function(data, data2){
		try {
			console.log(data2);
			verificate(data2._id, data2.session, 'isModerator', function(rep1){
				if(rep1) {
					data = '@' + data.toUpperCase();
					Userschema.findOne({loginUpperCase: data}, 'isModerator login', function(err, rep){
						if (rep !== null) {
							if (rep.isEditor == false) {
								Userschema.update({loginUpperCase: data}, {$set: {isModerator: true}}, function(err, rep2){
									client.emit('moderatorAdded', rep.login);
									writeLog(data2._id + " made" + rep.login + " an EDITOR");
								});
							} else {
								Userschema.update({loginUpperCase: data}, {$set: {isModerator: false}}, function(err, rep2){
									client.emit('moderatorRemoved', rep.login);
									writeLog(data2._id + " made" + rep.login + " an EDITOR");
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
	
	client.on('banAuthor', function(data, data2){ /*по команде бан меняем значение в хэшмапе пользователя на противоположное*/
		try {
			console.log(data);
			verificate(data2._id, data2.session, 'isModerator', function(rep1){
				if (rep1) {
					data = data.toUpperCase();
					Userschema.findOne({loginUpperCase: data}, 'isBanned login', function(err, rep){
						if (rep !== null) {
							if (rep.isBanned == false) {
								Userschema.update({loginUpperCase: data}, {$set: {isBanned: true}}, function(err, rep2){
									client.emit('banSuccess', rep.login);
									client.broadcast.emit('banRealTime', rep.login);
									redisClient.sadd('banList', data);
									writeLog(data2._id + " banned " + rep.login);
								});
							} else {
								Userschema.update({loginUpperCase: data}, {$set: {isBanned: false}}, function(err, rep2){
									client.emit('banCancel', rep.login);
									client.broadcast.emit('banCancelRealTime', rep.login);
									redisClient.srem('banList', data);
									writeLog(data2._id + " unbanned " + rep.login);
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
				console.log(rep);
				client.emit('banListCardinality', rep);
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('banListNeeded', function(data){
		console.log('banListNeeded');
		try {
			redisClient.smembers('banList', function(err, reps){
					var start = data * 10 - 10; /*10 persons per page*/
					var end = data * 10;
					var repsToSend = reps.slice(start, end);
					client.emit('banListSent', repsToSend);
			});
		} catch(e) {
			writeLog(e);
		}
	});
	
	client.on('searchBanned', function(data){
		try {
			var dataToFind = data.toUpperCase();
				redisClient.sismember('banList', dataToFind, function(err, rep2) {
					if(rep2 === 1) {
						Userschema.findOne({loginUpperCase: dataToFind}, 'login', function(err, rep3){
							if (rep3 !== null) {
								client.emit('heIsBanned', rep3.login);
							}
						});
					} else {
						client.emit('bannedNotFound');
					}
				});
		} catch(e) {
			writeLog(e);
		}
	});
	
	
	client.on("changeUserEmail", function(data){
		try {
			simpleVerificate(data._id, data.session, function(reply){
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
			simpleVerificate(data._id, data.session, function(rep){
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
							from: 'versus', // sender address
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