var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Client=new mongoo.Schema({
	loginUpperCase: {type: String},
	login: {type: String},
	socket_id:{type: String}
});

module.exports = mongoose.model('client', Client);