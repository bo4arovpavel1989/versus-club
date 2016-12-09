var loginInvalid = [];	/*массив для проверки занятости логина на уровне html*/
var userData;
var loggedIn = false;
var socket = io.connect('http://localhost:8080');