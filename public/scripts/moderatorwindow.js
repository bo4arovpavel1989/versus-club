$("#banForm").submit(function(e){
	var banName = $("#nameBan").val();
	banName = '@' + banName;
	var banData = new SocketData();
	banData.messageNickToBan = banName;
	socket.emit('banAuthor', banData);
	$("#nameBan").val('');
	return false;
});


function minimizeModWin(clickedItem) {
	$(clickedItem).parent().hide(600);
	isModeratorWindowOpened = false;
}
