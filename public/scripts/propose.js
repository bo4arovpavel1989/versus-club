screenPosition = 0;
if (loggedIn) { /*форма предложки открывается только для авторизованных*/
	$.ajax({
					url: "../views/proposalForm.html",
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
	var verificationInfo = {_id: userData._id, session: document.cookie, login: userData.login};
	if(confirmAction) {
		socket.emit('clearPropose', verificationInfo);
		location.reload();
	}
	
}