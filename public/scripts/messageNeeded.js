var emitCounter = 0;
socket.emit('messageNeeded', emitCounter);
function getMoreMessages() {
	emitCounter = emitCounter + 11;
	console.log(emitCounter);
	socket.emit('messageNeeded', emitCounter);
}