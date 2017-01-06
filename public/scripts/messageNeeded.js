var emitCounter = 0;
startMessageNeeded();
function startMessageNeeded(){
	$(document).ready(function(){
		getMessages();
	});
}
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
		var deleteData = {_id: userData._id, session: document.cookie, messageID: messageIDToDelete};
		socket.emit('deleteMessage', deleteData);
		messageClicked.prev().remove();
		messageClicked.next().remove();
		messageClicked.remove();
	}
}

function banAuthor(messageClicked){
	var messageNickToBan = messageClicked.prev().prev().attr('data-messagenick');
	var banData = {_id: userData._id, session: document.cookie, messageNickToBan: messageNickToBan};
	socket.emit('banAuthor', banData);
}

