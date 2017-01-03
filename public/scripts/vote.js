startVote();

function startVote(){
	$(document).ready(function(){
		getVotes();		
		if (!loggedIn) {
			$("#voteForm").hide();
			$("#voteResult").hide();
			$("#unauthorMess").append("<p>Голосование доступно только авторизованным пользователям</p>");
		}
		if(userData.isEditor) {
			$('#clearVote').show();
		}
	});
}

function submitFormHandler() {
	$("#voteForm").submit(function(e){
			var a = $('input[name="vote"]:checked').val();
			console.log(a);
			var voteData = {votedLogin: userData.login, vote: a, session: document.cookie, _id: userData._id};
			socket.emit('vote', voteData);
			$("#voteForm").hide();
			$("#voteResult").empty();
			getVotes();
			return false;
		});
}

function getVotes() {
		var voteUrl = ipServer + '/getvotes?login=' + userData.login;	
		$.ajax({
				url: voteUrl,
				dataType: 'html',
				success: function(html){
					$("#voteResult").append(html);
					submitFormHandler();
					$("#voteResult").show();
				}
		});
}

function clearVote() {
	var confirmAction = confirm('Уверен?');
	var verificationInfo = {_id: userData._id, session: document.cookie, login: userData.login};
	if(confirmAction) {
		socket.emit('clearvote', verificationInfo);
		confirmAction = confirm('Создать новое голосование?');
		if (confirmAction) {
			changeVote();
		}
		location.reload();
	}
}

function changeVote() {
	var battle1 = prompt("Первый вариант", 'no battle');
	var battle2 = prompt("Второй вариант", 'no battle');
	var battle3 = prompt("Третий вариант", 'no battle');
	var battlers = {first: battle1, second: battle2, third: battle3};
	var verificationInfo = {_id: userData._id, session: document.cookie, login: userData.login};
	socket.emit('changeVote', battlers, verificationInfo);
	location.reload();
}
