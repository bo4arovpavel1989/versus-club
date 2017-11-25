(function(window){
	var userData = window.userData || {};
	var SocketData=window.SocketData;
	var socket = window.socket;
	$("#banForm").submit(function(e){
		var banName = $("#nameBan").val();
		banName = '@' + banName;
		var banData = new SocketData();
		banData.messageNickToBan = banName;
		socket.emit('banAuthor', banData);
		$("#nameBan").val('');
		return false;
	});


	window.minimizeModWin = function(clickedItem) {
		$(clickedItem).parent().hide(600);
		isModeratorWindowOpened = false;
	}
})(window);	
