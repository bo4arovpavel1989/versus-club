var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/versus-club', { config: { autoIndex: false } });
mongoose.Promise = global.Promise;

var User = new mongoose.Schema({
	loginUpperCase: {type: String, required: true, unique: true},
	login: {type: String, required: true},
	password: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	session: {type: String, default: 000},
	isBanned: {type: Boolean, default: false},
	isModerator: {type: Boolean, default: false},
	isEditor: {type: Boolean, default: false},
	activity: {type: Number, default: 0},
	avatarUrl: {type: String, default: '/avatars/no-ava01.jpeg'}
});

module.exports = mongoose.model('userdata', User);