$("#makeEditorForm").submit(function(e){
	var editorName = $("#nameEditor").val();
	var masterData = {_id: userData._id, session: document.cookie, editorName: editorName};
	socket.emit('makeEditor', masterData);
	$("#nameEditor").val('');
	return false;
});

$("#makeModeratorForm").submit(function(e){
	var moderatorName = $("#nameModerator").val();
	var masterData = {_id: userData._id, session: document.cookie, moderatorName: moderatorName};
	socket.emit('makeModerator', masterData);
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