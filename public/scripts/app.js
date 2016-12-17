		var emailInvalid=[];
		var userData = {}; /*пользовательские данные*/
		var loggedIn = false; /*переменная проверяет совершен ли аторизованный вход в систему*/
		var loginButtonClicked = false;
		var ipServer = 'http://109.120.138.53:8080'
		var socket = io.connect(ipServer);;
		var session;
		var sessionArray;
		
		$( document ).ready(function() {
			if (document.cookie.length > 1) {
					session = document.cookie;
					authorize();
				} else {
					$('#loginFormToHide').show();
				}
		});
		
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
		
		function authorize() { /*вход в систему после авторизации*/
				if (document.cookie.length > 1) {
					socket.emit('getData', document.cookie);
				}
		}
		
		function checkPasswords() {
			var passl = document.getElementById("inputPasswordReg1");
			var pass2 = document.getElementById("inputPasswordReg2");
			if(passl.value!=pass2.value)
				passl.setCustomValidity("Пароли  не совпадают. Пожалуйста, проверьте  идентичность паролей в обоих полях!");
			else
			passl.setCustomValidity("");
		}	
		
		function checkLogin() {
		 var logl = document.getElementById("inputLoginReg"); /*переменная для установки значения setCustomValidity*/
		 var log1 = '@' + $("#inputLoginReg").val(); /*Переменная для непосредственного сравнения логинов*/
		 log1 = log1.toUpperCase();
		 socket.emit('checkLogin', log1);
		 socket.on('loginIsInavailable', function(){
			 $('#inputLoginReg').parent().parent().removeClass('has-success');
			 $('#inputLoginReg').parent().parent().addClass('has-error');
			 logl.setCustomValidity("Логин уже занят");
		 });
		 socket.on('loginIsAvailable', function(){
			logl.setCustomValidity("");
			var checkSymbol1 = log1.indexOf("\"");
			var checkSymbol2 = log1.indexOf("\'");
			if (checkSymbol1 == -1 && checkSymbol2 == -1 ) {
				$('#inputLoginReg').parent().parent().removeClass('has-error');
				$('#inputLoginReg').parent().parent().addClass('has-success');
				logl.setCustomValidity("");
			} else {
				$('#inputLoginReg').parent().parent().removeClass('has-success');
				$('#inputLoginReg').parent().parent().addClass('has-error');
				logl.setCustomValidity("Логин не должен содержать символы: \' \"");
			}
		 });
		}
		
		function checkEmail() {
			 var email = document.getElementById("inputEmail"); /*переменная для установки значения setCustomValidity*/
			 var emailToCheck = $("#inputEmail").val();
			 var checkEmail = emailInvalid.indexOf(emailToCheck);
			 socket.emit('checkEmail', emailToCheck);
			 socket.on('emailIsInavailable', function(){
				$('#inputEmail').parent().parent().removeClass('has-success');
				$('#inputEmail').parent().parent().addClass('has-error');
				email.setCustomValidity("E-mail уже занят");
			 });
			 socket.on('emailIsAvailable', function(){
				$('#inputEmail').parent().parent().removeClass('has-error');
				$('#inputEmail').parent().parent().addClass('has-success');
				email.setCustomValidity("");
			 });
		}
		
		if (loggedIn == true) {
				authorize();
		}
		
		function closeTab(){
			$("#tabsData").empty();
			$('.loader').addClass('loading');
			$.ajax({
					url: '../views/crowdfunding.html',
					success: function(html){
						$('.loader').removeClass('loading');
						$("#tabsData").hide();
						$("#tabsData").append(html);
						$("#tabsData").fadeIn(600);
					}
				});
		}
		
$("#loginForm").submit(function(e){ /*обработчик входа в систему*/
	if (!loginButtonClicked) {
		loginButtonClicked = true;
		var log = $("#inputLogin").val();
		var pass = $("#inputPassword").val();
		var loginData = {login: log, passwd: pass};
		socket.emit('login', loginData);
	}
	return false;
});

$("#forgotFormEmail").submit(function(e){
	var forgotEmail = $("#inputForgotEmail").val();
	socket.emit('forgotEmail', {forgotEmail: forgotEmail});
	$("#inputForgotEmail").val('');
	return false;
});


$("#forgotForm").submit(function(e){
	var forgotLogin = $("#inputForgotLogin").val();
	socket.emit('forgotLogin', {forgotLogin: forgotLogin});
	$("#inputForgotLogin").val('');
	return false;
});

$("#changeUserEmailForm").submit(function(e){
	var newEmail = $("#inputNewEmail").val();
	var dataToChange = {_id: userData._id, email: newEmail, session: document.cookie};
	socket.emit('changeUserEmail', dataToChange);
	return false;
});


$("#changeUserDataForm").submit(function(e){
	var oldPass = $("#inputOldPass").val();
	var newPass = $("#inputPasswordChange2").val();
	var dataToChange = {_id: userData._id, pass: oldPass, newpass: newPass, session: document.cookie};
	socket.emit('changeUserData', dataToChange);
	return false;
});

socket.on('invalidSession', function(){
	$('#loginFormToHide').show();
});

socket.on('emailSendFail', function() {
	alert('Ошибка отправления!');
});

socket.on('checkYouEmail', function(){
	alert('Пароль выслан тебе на почту, указанную при регистрации');
});

socket.on('changeUserDataSuccess', function(){
	alert("Данные успешно изменены");
	window.location.assign(ipServer);
});

socket.on('changeUserdataFailed', function(){
	alert("Неверный пароль");
});


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

socket.on('registerFail', function(){
	$("#loginFailedMessage").children().remove();
	$("#loginFailedMessage").append("<div class='alert alert-danger'><strong>Ошибка!</strong> Логин уже занят.</div>");
});
socket.on('registerSuccess', function(){
	window.location.assign(ipServer);
	$("#loginMessage").append("<div class='alert alert-success'><strong>Готово!</strong> Введите логин и пароль. </div>");
});
socket.on("loginFailed", function(){
	$('#loginFormToHide').show();
	$("#loginMessage").empty();
	$("#loginMessage").append("<div class='alert alert-danger'><strong>Ошибка!</strong> Неверное имя пользователя или пароль.</div>");
	loginButtonClicked = false;
});

socket.on("emailInvalid", function(data){
	emailInvalid = data;
});

socket.on("loginSuccess", function(data){ /*сервер подтвердил правильность логина и пароля*/
	$("#loginMessage").empty();
	loggedIn = true;
	document.cookie = data;
	session = data;
	authorize();
});


/*кнопка наверх*/

$('#scrollup img').click( function(){
		window.scroll(0 ,0); 
		return false;
	});

	$(window).scroll(function(){
		if ( $(document).scrollTop() > 0 ) {
			$('#scrollup').fadeIn('fast');
		} else {
			$('#scrollup').fadeOut('fast');
		}
	});