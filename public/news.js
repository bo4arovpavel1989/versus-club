var emitNewsCounter = 0;
if (userData.isEditor) {
	$.ajax({
					url: "newsForm.html",
					success: function(html){
						$("#newsFormToLoad").append(html);
					}
				});
}
socket.emit('newsNeeded', emitNewsCounter);
$("#newsForm").submit(function(e){

});
function getMoreNews() {
	emitNewsCounter = emitNewsCounter + 6;
	socket.emit('newsNeeded', emitNewsCounter);
}