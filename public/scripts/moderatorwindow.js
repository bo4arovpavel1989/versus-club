$("#banForm").submit(function(e){
	var banName = $("#nameBan").val();
	banName = '@' + banName;
	var confirmData = {_id: userData._id, session: document.cookie};
	var banData = {_id: userData._id, session: document.cookie, messageNickToBan: banName};
	socket.emit('banAuthor', banData);
	$("#nameBan").val('');
	return false;
});


function minimizeModWin(clickedItem) {
	$(clickedItem).parent().hide(600);
	isModeratorWindowOpened = false;
}
