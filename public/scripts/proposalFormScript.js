startProposalFormScript();

function startProposalFormScript(){
	$(document).ready(function(){
		$("#proposalForm").submit(function(e){ 
			if (!userData.isBanned) {
				var propose1 = $("#inputPropose1").val();
				var propose2 = $("#inputPropose2").val();
				//var proposalData = {login: userData.login, _id: userData._id, propose1: propose1, propose2: propose2, session: document.cookie};
				var proposalData = new SocketData();
				proposalData.login = userData.login;
				proposalData.propose1 = propose1;
				proposalData.propose2 = propose2;
				socket.emit('proposeUpload', proposalData);
				$("#inputPropose1").val('');
				$("#inputPropose2").val('');
				return false;
			} else {
				alert("Забаненные не могут предлагать");
				return false;
			}
		});
		
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
		 
	});
}

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
