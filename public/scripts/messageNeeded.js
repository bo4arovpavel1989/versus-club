(function(window){
	var userData = window.userData || {};
	var SocketData=window.SocketData;
	var socket = window.socket;
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


	fwindow.getMoreMessages = function() {
		emitCounter = emitCounter + 11;
		getMessages();
	}

	window.deleteMessage = function (messageClicked){
		var confirmAction = confirm('Уверен?');
		if (confirmAction) {
			var messageIDToDelete = messageClicked.prev().attr('data-messageID');
			//var deleteData = {_id: userData._id, session: document.cookie, messageID: messageIDToDelete};
			var deleteData = new SocketData();
			deleteData.messageID = messageIDToDelete;
			socket.emit('deleteMessage', deleteData);
			messageClicked.prev().remove();
			messageClicked.next().remove();
			messageClicked.remove();
		}
	}

	window.banAuthor = window.banAuthor || function (messageClicked){
		var messageNickToBan = messageClicked.prev().prev().attr('data-messagenick');
		//var banData = {_id: userData._id, session: document.cookie, messageNickToBan: messageNickToBan};
		var banData = new SocketData();
		banData.messageNickToBan = messageNickToBan;
		socket.emit('banAuthor', banData);
	}
})(window);
