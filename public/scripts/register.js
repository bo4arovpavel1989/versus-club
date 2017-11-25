(function(window){
	$(document).ready(function(){
		var socket = window.socket;
		$('#inputLoginReg').keypress(function(key) { /*protect from symbols ' and " in username, because it caueses troubles*/
				if(key.charCode < 48 && key.charCode > 32) {
					document.getElementById("inputLoginReg").setCustomValidity("Логин не должен содержать символы: \' \"");
					return false;
				}
		});
		
	});

	window.checkPasswords = function() {
		var passl = document.getElementById("inputPasswordReg1");
		var pass2 = document.getElementById("inputPasswordReg2");
		if(passl.value!=pass2.value)
			passl.setCustomValidity("Пароли  не совпадают. Пожалуйста, проверьте  идентичность паролей в обоих полях!");
		else
		passl.setCustomValidity("");
	};	
		
	window.checkLogin = function() {
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
	};
			
	window.checkEmail = function() {
		 var email = document.getElementById("inputEmail"); /*переменная для установки значения setCustomValidity*/
		 var emailToCheck = $("#inputEmail").val();
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
})(window);	