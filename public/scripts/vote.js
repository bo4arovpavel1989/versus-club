(function(window){
	var userData = window.userData || {};
	var SocketData=window.SocketData;
	var socket = window.socket;
	var loggedIn = window.loggedIn;
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
				//var voteData = {votedLogin: userData.login, vote: a, session: document.cookie, _id: userData._id};
				var voteData = new SocketData();
				voteData.votedLogin = userData.login;
				voteData.vote = a;
				socket.emit('vote', voteData);
				getVotes();	
				return false;
			});
	}

	function getVotes() {
			$("#voteResult").empty();
			$("#voteResult").hide();
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
		//var verificationInfo = {_id: userData._id, session: document.cookie, login: userData.login};
		var verificationInfo = new SocketData();
		verificationInfo.login = userData.login;
		if(confirmAction) {
			confirmAction = confirm('Создать новое голосование?');
			if (confirmAction) {
				changeVote();
			} else {
				socket.emit('clearvote', verificationInfo);
				location.reload();
			}
		}
	}

	function changeVote() {
		$.ajax({
						url: "../views/changevoteform.html",
						success: function(html){
							$("#forMessageWindow").append(html);
							$('#changevoteForm').show(600);
						}
					});
	}
})(window);