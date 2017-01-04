var fs = require('fs-extra');
var redis = require('redis');
var redisClient = redis.createClient();
var https = require('https');
var Userschema = require('./models/mongoSchema.js');
var Newsschema = require('./models/newsMongoSchema.js');



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

var getPercentage = function(val1, val2, val3) {
	var answer = [];
	val1 = Number(val1);
	val2 = Number(val2);
	val3 = Number(val3);
	var sumVal = val1 + val2 + val3;
	if (sumVal != 0) {
		var percV1 = (val1/sumVal) * 100;
		var percV2 = (val2/sumVal) * 100;
		var percV3 = (val3/sumVal) * 100;
		answer.push(percV1);
		answer.push(percV2);
		answer.push(percV3);
		return answer;
	} else {
		return false;
	}
}

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

module.exports.getPercentage = getPercentage;
module.exports.verifyRecaptcha = verifyRecaptcha;
module.exports.writeLog = writeLog;
module.exports.getRandomInt = getRandomInt;
module.exports.formatDate = formatDate;
module.exports.verificate = verificate;
module.exports.simpleVerificate = simpleVerificate;
module.exports.checkPropose = checkPropose;
