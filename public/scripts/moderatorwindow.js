$("#banForm").submit(function(e){
	var banName = $("#nameBan").val();
	var confirmData = {_id: userData._id, session: document.cookie};
	socket.emit('banAuthor', '@' + banName, confirmData);
	$("#nameBan").val('');
	return false;
});


function minimizeModWin(clickedItem) {
	$(clickedItem).parent().hide(600);
	isModeratorWindowOpened = false;
}
