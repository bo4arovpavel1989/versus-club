$("#makeEditorForm").submit(function(e){
	var editorName = $("#nameEditor").val();
	var confirmData = {_id: userData._id, session: document.cookie};
	socket.emit('makeEditor', editorName, confirmData);
	$("#nameEditor").val('');
	return false;
});

$("#makeModeratorForm").submit(function(e){
	var moderatorName = $("#nameModerator").val();
	var confirmData = {_id: userData._id, session: document.cookie};
	socket.emit('makeModerator', moderatorName, confirmData);
	$("#nameModerator").val('');
	return false;
});

function minimizeMasWin(clickedItem) {
	$(clickedItem).parent().hide(600);
	isMasterWindowOpened = false;
}
socket.on('editorAdded', function(data){
	alert(data + ' сделан редактором');
});
socket.on('moderatorAdded', function(data){
	alert(data + ' сделан модератором');
});
socket.on('editorRemoved', function(data){
	alert(data + ' удален из редакторов');
});
socket.on('moderatorRemoved', function(data){
	alert(data + ' удален из модераторов');
});