
$("#proposalForm").submit(function(e){ 
	if (!userData.isBanned) {
		var propose1 = $("#inputPropose1").val();
		var propose2 = $("#inputPropose2").val();
		var proposalData = {login: userData.login, propose1: propose1, propose2: propose2, session: document.cookie};
		socket.emit('proposeUpload', proposalData);
		$("#inputPropose1").val('');
		$("#inputPropose2").val('');
		return false;
	} else {
		alert("Забаненные не могут предлагать");
		return false;
	}
});

if(userData.activity > 4) {
	$("#proposalForm").show();
}

function likePropose(clickedPropose) {
		if (loggedIn && !userData.isBanned) { /*если авторизован и не забанен то можешь плюсовать*/
			/*screenPosition = window.pageYOffset; старая версия - возврат к положению на странице после перезагрузки*/
			var proposeItself = clickedPropose.parent().attr("data-propose");
			var proposePlusData = {login: userData.login, propose: proposeItself, session: document.cookie};
			socket.emit('proposePlused', proposePlusData);
			/*$('#proposalItems').empty();
			socket.emit("proposeNeeded");  экранировал старый вариант, чтоб не обновлял список предложек*/
		}
		return false;
}

$('#inputPropose1').keypress(function(key) { /*protect from symbols ' and " in username, because it caueses troubles*/
        if(key.charCode < 48 && key.charCode > 32) {
			document.getElementById("inputPropose1").setCustomValidity("Логин не должен содержать символы: \' \"");
			return false;
		}
 });
 $('#inputPropose2').keypress(function(key) { /*protect from symbols ' and " in username, because it caueses troubles*/
        if(key.charCode < 48 && key.charCode > 32) {
			document.getElementById("inputPropose2").setCustomValidity("Логин не должен содержать символы: \' \"");
			return false;
		}
 });
 
 function checkProposeForSymbols() {
	var prop1 = $("#inputPropose1").val(); 
	var prop2 = $("#inputPropose1").val(); 
	var prop = prop1 + prop2;
	var checkSymbol1 = prop.indexOf("\"");
	var checkSymbol2 = prop.indexOf("\'");
		if (checkSymbol1 == -1 && checkSymbol2 == -1 ) {
				document.querySelector("#inputPropose1").setCustomValidity("");
				document.querySelector("#inputPropose2").setCustomValidity("");
		} else {
				document.querySelector("#inputPropose1").setCustomValidity("Предложка не должна содержать символы: \' \"");
				document.querySelector("#inputPropose2").setCustomValidity("Предложка не должна содержать символы: \' \"");
		}
 }