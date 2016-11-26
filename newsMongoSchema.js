var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var News = new mongoose.Schema({
	title: {type: String, required: true},
	body: {type: String, required: true},
	img: {type: String},
	date: {type: String},
	likes: {type: Number, default: 0},
	likedOnes: {type: Array},
	comments: {type: Array}
});

module.exports = mongoose.model('news', News);