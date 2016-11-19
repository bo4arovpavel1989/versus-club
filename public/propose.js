screenPosition = 0;
if (loggedIn) { /*форма предложки открывается только для авторизованных*/
	$.ajax({
					url: "proposalForm.html",
					success: function(html){
						$("#contentToPropose").append(html);
					}
				});		
}
socket.emit("proposeNeeded"); /*просим от сервера список предложек*/
if(!userData.isEditor) {
	$('#clearPropose').hide();
}
function clearPropose() {
	var confirmAction = confirm('Уверен?');
	var verificationInfo = {login: userData.login, session: document.cookie};
	if(confirmAction) {
		socket.emit('clearPropose', verificationInfo);
		location.reload();
	}
	
}