(function(window){
	var userData = window.userData || {}; /*пользовательские данные*/
	var loggedIn = false; /*переменная проверяет совершен ли аторизованный вход в систему*/
	var loginButtonClicked = false;
	var ipServer = 'http://109.120.170.187:80';
	window.ipServer = ipServer;
	var PORT = 80;
	var ACTIVITY = 4; /*minimum ativity to get access to proposalForm*/
	window.ACTIVITY = ACTIVITY;
	//var socket = io.connect(ipServer);;
	var socket = socketCluster.connect(PORT);
	window.socket = socket;
	var session;
		
	$( document ).ready(function() {
		if (getCookie('session')) {
			console.log(getCookie('session'))
			session = getCookie('session');
			window.session = session;
			authorize();
			} else {
				$('#loginFormToHide').show();
		}
					
		$("#loginForm").submit(function(e){ /*обработчик входа в систему*/
			if (!loginButtonClicked) {
				loginButtonClicked = true;
				window.loginButtonClicked = loginButtonClicked;
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
			if (getCookie('session')) {
				socket.emit('getData', getCookie('session'));
			}
	}
					
	function getCookie(name) {
	  var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	  ));
	  return matches ? decodeURIComponent(matches[1]) : undefined;
	}

	function setCookie(name, value, options) {
	  options = options || {};
	  //options.path = '/';
	  var expires = options.expires;

	  if (typeof expires == "number" && expires) {
		var d = new Date();
		d.setTime(d.getTime() + expires * 1000);
		expires = options.expires = d;
	  }
	  if (expires && expires.toUTCString) {
		options.expires = expires.toUTCString();
	  }

	  value = encodeURIComponent(value);

	  if(getCookie(name)) value = getCookie(name) + ', ' + value;
	  
	  var updatedCookie = name + "=" + value;

	  for (var propName in options) {
		updatedCookie += "; " + propName;
		var propValue = options[propName];
		if (propValue !== true) {
		  updatedCookie += "=" + propValue;
		}
	  }
	  document.cookie = updatedCookie;
	  window.userData = userData;
	}
})(window);
