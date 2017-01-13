$("#changevoteForm").submit(function(e){
	var battle1 = $("#nameBattle1").val();
	var battle2 = $("#nameBattle2").val();
	var battle3 = $("#nameBattle3").val();
	var battlers = new SocketData();
	battlers.first = battle1;
	battlers.second = battle2;
	battlers.third = battle3;
	battlers.login = userData.login;
	socket.emit('changeVote', battlers);
	location.reload();
	return false;
});