/*authentific sockets*/
socket.on('takeData', function(data){
	loggedIn = true;
	userData = data;
	console.log(userData);
	$("#loginFormToHide").remove();
		$.ajax({
			url: "../views/personalcabinet.html",
			success: function(html){
				$("#contentToUpload").append(html);
			}
		});
});

socket.on('invalidSession', function(){
	$('#loginFormToHide').show();
});

socket.on("loginFailed", function(){
	$('#loginFormToHide').show();
	$("#loginMessage").empty();
	$("#loginMessage").append("<div class='alert alert-danger'><strong>Ошибка!</strong> Неверное имя пользователя или пароль.</div>");
	loginButtonClicked = false;
});



socket.on("loginSuccess", function(data){ /*сервер подтвердил правильность логина и пароля*/
	$("#loginMessage").empty();
	loggedIn = true;
	document.cookie = data;
	session = data;
	authorize();
});

/*forgotform sockets*/
socket.on('emailSendFail', function() {
	alert('Ошибка отправления!');
});

socket.on('checkYouEmail', function(){
	alert('Пароль выслан тебе на почту, указанную при регистрации');
});

/*options sockets*/
socket.on('changeUserDataSuccess', function(){
	alert("Данные успешно изменены");
	window.location.assign(ipServer);
});

socket.on('changeUserdataFailed', function(){
	alert("Неверный пароль");
});

/*userbans sockets*/
socket.on('banRealTime', function(data){
	if (userData.login == data) {
		alert('Тишину поймали!');
		location.reload();
	}
});

socket.on('banCancelRealTime', function(data){
	if (userData.login == data) {
		alert('Пошуми, бл#ть!');
		location.reload();
	}
});

socket.on('banSuccess', function(data){
	alert(data + " забанен!");
});

socket.on('banCancel', function(data){
	alert(data + " разбанен!");
});

/*register sockets*/
socket.on('registerFail', function(){
	$("#loginFailedMessage").children().remove();
	$("#loginFailedMessage").append("<div class='alert alert-danger'><strong>Ошибка!</strong> Логин уже занят.</div>");
});

socket.on('registerSuccess', function(){
	window.location.assign(ipServer);
	$("#loginMessage").append("<div class='alert alert-success'><strong>Готово!</strong> Введите логин и пароль. </div>");
});

socket.on("emailInvalid", function(data){
	emailInvalid = data;
});

/*message sckets*/
socket.on('messageSentRealTime', function(data, data2){   /*разделил прием сообщения из архива и в реальном времени, т.к. они располагаются в разном порядке. В реальном добавляются ПЕРЕД существующими*/
if (!userData.isModerator) {
	$("#messagesReceived").prepend("<li class = 'message' ><div class=\'messagenick\'><a href='#' data-login=\'" + data.messageNick + "\' onclick=\'appealTo($(this)); return false\' class=\'appealTo\'>" + data.messageNick + "</a>:</div>" +
	"<div class=\'avatarMessage\' style=\"background-image: url(" + data.avatarUrl + ");\"></div>" +
	"<blockquote class=\'messagebody\'>" + data.message + "</blockquote></li>");
	} else {
		$("#messagesReceived").prepend("<li class = 'message' data-messagenick=\'" + data.messageNick + "\' data-messageID=\'" + data2 + "\'>" + 
		"<div class=\'messagenick\'><a href='#' data-login=\'" + data.messageNick + "\' onclick=\'appealTo($(this)); return false\' class=\'appealTo\'>" + data.messageNick + "</a>:</div>" +
		"<div class=\'avatarMessage\' style=\"background-image: url(" + data.avatarUrl + ");\"></div>" +
		"<blockquote class=\'messagebody\'>" + data.message + "</blockquote></li>" + 
		"<a href='#' class='deleteMessage' onclick=\'deleteMessage($(this)); return false;\'>удалить </a>" + 
		"<a href='#' class='banAuthor' onclick=\'banAuthor($(this)); return false;\'> бан/разбан</a>");
	}
});


/*like sockets*/
socket.on('newPlus', function(data, like){
	var fff = '[data-propose = "' + data + '"]';
	$(fff).find('.proposePlus').html('<strong>[' + like + ']</strong> - <span class="glyphicon glyphicon-thumbs-up"></span>');
});

socket.on('newNewsLike', function(data, like){
	var fff = '[data-newskey = "' + data + '"]';
	$(fff).find('strong').html('[' + like + ']');
});

/*banlist sockets*/
socket.on('banListCardinality', function(data){
	if(data !==0) 
	numberOfPages = data/10; /*banned persons per page*/
	numberOfPages = Math.ceil(numberOfPages);
	if (numberOfPages > 1) {
		for (var pageNum = 2; pageNum <= numberOfPages; pageNum++) { /*first page always presents, so we start from the second*/
			$('.pagination').append('<li><a href=\'#\' class=\'banListPage\' onclick=\'askForBanList($(this)); return false;\'>' + pageNum + '</a></li>');
		}
		if (numberOfPages > 8) {
			shortPagination();
		}
	}
});