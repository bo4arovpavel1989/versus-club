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
 var banChannel = socket.subscribe('banRealTime');

 banChannel.on('subscribeFail', function(err) {  
    console.log('Failed to subscribe to Yell channel due to error: ' + err);
 });

 banChannel.watch(function (data) {  
    if (userData.login == data) {
		alert('Тишину поймали!');
		location.reload();
	}
 });

 var banCancelChannel = socket.subscribe('banCancelRealTime');

 banCancelChannel.on('subscribeFail', function(err) {  
    console.log('Failed to subscribe to Yell channel due to error: ' + err);
 });

 banCancelChannel.watch(function (data) {  
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

 var chatChannel = socket.subscribe('yell');

 chatChannel.on('subscribeFail', function(err) {  
    console.log('Failed to subscribe to Yell channel due to error: ' + err);
 });

 chatChannel.watch(function (data) {  
    var template = Handlebars.compile( $('#realTimeMessage').html() );
	data.isModeratorView = userData.isModerator;
	$('#messagesReceived').prepend( template(data) );
 });


/*like sockets*/
socket.on('newPlus', function(data){
	var fff = '[data-propose = "' + data.propose + '"]';
	$(fff).find('.proposePlus').html('<strong>[' + data.likes + ']</strong> - <span class="glyphicon glyphicon-thumbs-up"></span>');
});

socket.on('newNewsLike', function(data){
	var fff = '[data-newskey = "' + data.newsID + '"]';
	$(fff).find('strong').html('[' + data.likesNew + ']');
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