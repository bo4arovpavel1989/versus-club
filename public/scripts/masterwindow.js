(function(window){
	var userData = window.userData || {};
	var SocketData=window.SocketData;
	var socket = window.socket;
	$("#makeEditorForm").submit(function(e){
		var editorName = $("#nameEditor").val();
		//var masterData = {_id: userData._id, session: document.cookie, editorName: editorName};
		var masterData = new SocketData();
		masterData.editorName = editorName;
		socket.emit('makeEditor', masterData);
		$("#nameEditor").val('');
		return false;
	});

	$("#makeModeratorForm").submit(function(e){
		var moderatorName = $("#nameModerator").val();
		//var masterData = {_id: userData._id, session: document.cookie, moderatorName: moderatorName};
		var masterData = new SocketData();
		masterData.moderatorName = moderatorName;
		socket.emit('makeModerator', masterData);
		$("#nameModerator").val('');
		return false;
	});

	window.minimizeMasWin = function (clickedItem) {
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
})(window);