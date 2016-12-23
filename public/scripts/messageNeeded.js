var emitCounter = 0;

getMessages();

function getMessages () {
			var moderatorQuery = (userData.isModerator == true) ? 1 : 0;
			var messageUrl = ipServer + '/getmessages?counter=' + emitCounter + '&moderatorQuery=' + moderatorQuery;	
			$.ajax({
					url: messageUrl,
					dataType: 'html',
					success: function(html){
						$("#messagesReceived").append(html);
					}
				});
}

function getMoreMessages() {
	emitCounter = emitCounter + 11;
	getMessages();
}

function deleteMessage(messageClicked){
	var confirmAction = confirm('Уверен?');
	if (confirmAction) {
		var messageIDToDelete = messageClicked.prev().attr('data-messageID');
		var confirmData = {_id: userData._id, session: document.cookie};
		socket.emit('deleteMessage', messageIDToDelete, confirmData);
		messageClicked.prev().remove();
		messageClicked.next().remove();
		messageClicked.remove();
	}
}

function banAuthor(messageClicked){
	var confirmData = {_id: userData._id, session: document.cookie};
	var messageNickToBan = messageClicked.prev().prev().attr('data-messagenick');
	socket.emit('banAuthor', messageNickToBan, confirmData);
}
