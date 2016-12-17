socket.emit("voteDataNeeded");
var candidatesProposed = false;
var voteCandidates = [];
socket.on('voteCandidates', function(data){
	if (!candidatesProposed) {
		$('#firstCandidate').parent().append(data.first);
		$('#secondCandidate').parent().append(data.second);
		$('#thirdCandidate').parent().append(data.third);
		candidatesProposed = true;
	}	
	voteCandidates[0] = data.first;
	voteCandidates[1] = data.second;
	voteCandidates[2] = data.third;
});
if (!loggedIn) {
	$("#voteForm").hide();
	$("#voteResult").hide();
	$("#unauthorMess").append("<p>Голосование доступно только авторизованным пользователям</p>");
}
if(userData.isEditor) {
	$('#clearVote').show();
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

$("#voteForm").submit(function(e){
	var a = $('input[name="vote"]:checked').val();
	console.log(a);
	var voteData = {votedLogin: userData.login, vote: a, session: document.cookie, _id: userData._id};
	console.log(voteData);
	socket.emit('vote', voteData);
	$("#voteForm").hide();
	socket.emit("voteDataNeeded");
	$("#voteResult").empty();
	$("#voteResult").show();
	return false;
});