$("#banForm").submit(function(e){
	var banName = $("#nameBan").val();
	var confirmData = {login: userData.login, session: document.cookie};
	socket.emit('banAuthor', '@' + banName, confirmData);
	$("#nameBan").val('');
	return false;
});


function minimizeModWin(clickedItem) {
	$(clickedItem).parent().hide(600);
	isModeratorWindowOpened = false;
}
