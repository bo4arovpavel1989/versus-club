startPropose();

function startPropose(){
	$(document).ready(function(){
		if (userData.activity > ACTIVITY) { /*форма предложки открывается только для авторизованных*/
			$.ajax({
							url: "../views/proposalForm.html",
							success: function(html){
								$("#contentToPropose").append(html);
							}
						});		
		}

		if(userData.isEditor) {
			$('#clearPropose').show();
		}
		
		getProposes();
	});
}
function getProposes(){
	var moderatorQuery = (userData.isModerator == true) ? 1 : 0;
	var messageUrl = ipServer + '/getproposes?moderatorQuery=' + moderatorQuery;	
	$.ajax({
		url: messageUrl,
		dataType: 'html',
		success: function(html){
					$("#proposalItems").append(html);
				}
	});
}

function furtherButton() {
	$('#proposalItems').empty(); 
	getProposes(); 
	window.scroll(0 ,0);
}

function likePropose(clickedPropose) {
		if (loggedIn && !userData.isBanned) { /*если авторизован и не забанен то можешь плюсовать*/
			/*screenPosition = window.pageYOffset; старая версия - возврат к положению на странице после перезагрузки*/
			var proposeItself = clickedPropose.parent().attr("data-propose");
			var proposePlusData = {login: userData.login, _id: userData._id, propose: proposeItself, session: document.cookie};
			socket.emit('proposePlused', proposePlusData);
			/*$('#proposalItems').empty();
			socket.emit("proposeNeeded");  экранировал старый вариант, чтоб не обновлял список предложек*/
		}
		return false;
}

function clearPropose() {
	var confirmAction = confirm('Уверен?');
	var verificationInfo = {_id: userData._id, session: document.cookie, login: userData.login};
	if(confirmAction) {
		socket.emit('clearPropose', verificationInfo);
		location.reload();
	}
	
}

function banProposeAuthor(proposeClicked){
	var confirmData = {_id: userData._id, session: document.cookie};
	var messageNickToBan = proposeClicked.prev().prev().attr('data-proposeLogin');
	socket.emit('banAuthor', messageNickToBan, confirmData);
}

function deletePropose(proposeClicked){
	var confirmAction = confirm('Уверен?');
	if(confirmAction) {
		var proposeLoginToDelete = proposeClicked.prev().attr('data-proposelogin');
		var proposeToDelete = proposeClicked.prev().attr('data-propose');
		var deleteData = {login: proposeLoginToDelete, propose: proposeToDelete};
		var confirmData = {_id: userData._id, session: document.cookie};
		console.log(deleteData);
		socket.emit('deletePropose', deleteData, confirmData);
		proposeClicked.prev().remove();
		proposeClicked.next().remove();
		proposeClicked.remove();
	}
}


