var emitNewsCounter = 0;
if (userData.isEditor) {
	$.ajax({
					url: "../views/newsForm.html",
					success: function(html){
						$("#newsFormToLoad").append(html);
					}
				});
}
socket.emit('newsNeeded', emitNewsCounter);

$("#newsForm").submit(function(e){

});
function getMoreNews() {
	emitNewsCounter = emitNewsCounter + 5;
	socket.emit('newsNeeded', emitNewsCounter);
}


function likeNews(clicked){
	var newsIdToLike = $(clicked).parent().attr('data-newskey');
	var confirmData = {_id: userData._id, session: document.cookie};
	socket.emit('likeNews', newsIdToLike, confirmData);
	$(clicked).remove();
}
