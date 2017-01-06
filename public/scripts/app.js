		var emailInvalid=[];
		var userData = {}; /*пользовательские данные*/
		var loggedIn = false; /*переменная проверяет совершен ли аторизованный вход в систему*/
		var loginButtonClicked = false;
		var ipServer = 'http://109.120.138.53:8080';
		var ACTIVITY = 4; /*minimum ativity to get access to proposalForm*/
		//var socket = io.connect(ipServer);;
		var socket = socketCluster.connect(8080);
		var session;
		
$( document ).ready(function() {
	
	if (document.cookie.length > 1) {
		session = document.cookie;
			authorize();
		} else {
			$('#loginFormToHide').show();
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
						
});


function authorize() { /*вход в систему после авторизации*/
		if (document.cookie.length > 1) {
			socket.emit('getData', document.cookie);
		}
}
				


