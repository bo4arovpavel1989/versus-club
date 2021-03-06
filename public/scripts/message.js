(function(window){
	var userData = window.userData || {};
	var SocketData=window.SocketData;
	var socket = window.socket;
	startMessage();

	function startMessage(){
		$(document).ready(function(){
			$("#messageForm").submit(function(e){
				var message = $("#message").val();
				var messageNick = userData.login;
				//var messageData = {messageNick: messageNick, message: message, _id: userData._id, avatarUrl: userData.avatarUrl, session: document.cookie};
				var messageData = new SocketData();
				messageData.messageNick = messageNick;
				messageData.message = message;
				messageData.avatarUrl = userData.avatarUrl;
				console.log(messageData);
				socket.emit('messageSent', messageData);
				$("#message").val('');
				userData.activity++;
				return false;
			});

			$('#message').on('click', function(){
				$('#messageWindow').addClass('activeWindow');
			});
			$('#message').on('focus', function(e){
				$('#messageWindow').addClass('activeWindow');
				e.stopPropagation();
			});
			$('#message').on('blur', function(){
					$(document).on('click', function(e) {
						if($('#messageWindow').hasClass('activeWindow')) {
							if (!$(e.target).closest("#messageWindow").length) {
								$('#messageWindow').removeClass('activeWindow');
								$(document).unbind('click');
							}
							e.stopPropagation();
						}
					});
			});
		});
	}

	window.writeMessageButton = function (){
		$('#messageForm').show(600); 
		$('#messageForm').removeClass('hiddenwindow');
		$('#minimizeMessageWindow').html('<span class=\'glyphicon glyphicon-resize-small\'></span>'); 
		$('#message').focus(); 
		return false;
	}

	window.minimizeMesWin = function (clickedItem) {
		if (!$(clickedItem).prev().hasClass('hiddenwindow')) {
			$(clickedItem).prev().addClass('hiddenwindow');
			$(clickedItem).prev().hide(600, function(){
		
				$(clickedItem).html('<span class="glyphicon glyphicon-resize-full"></span>');
			});
		} else {
			$(clickedItem).prev().removeClass('hiddenwindow');
			$(clickedItem).prev().show(600, function(){
			
				$(clickedItem).html('<span class="glyphicon glyphicon-resize-small"></span>');
			});
		}
	};
	window.userData=userData;
})(window);	