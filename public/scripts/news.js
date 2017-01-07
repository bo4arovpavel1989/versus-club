var emitNewsCounter = 0;
startNews();

function startNews(){
	$(document).ready(function(){

		if (userData.isEditor) {
		$.ajax({
						url: "../views/newsForm.html",
						success: function(html){
							$("#newsFormToLoad").append(html);
						}
					});
		}
		
		getNews();	
		
		
	});
}


function getNews () {
			var editorQuery = (userData.isEditor == true) ? 1 : 0;
			var newsUrl = ipServer + '/getnews?counter=' + emitNewsCounter + '&editorQuery=' + editorQuery;	
			$.ajax({
					url: newsUrl,
					dataType: 'html',
					success: function(html){
						$("#newsToLoad").append(html);
						$("img").on('error', function () {
							$(this).hide();
						});
					}
				});
	}

function getMoreNews() {
	emitNewsCounter = emitNewsCounter + 5;
	getNews();
}

function likeNews(clicked){
	var newsIdToLike = $(clicked).parent().attr('data-newskey');
	//var likeData = {newsID: newsIdToLike, _id: userData._id, session: document.cookie};
	var likeData = new SocketData();
	likeData.newsID = newsIdToLike;
	socket.emit('likeNews', likeData);
	$(clicked).remove();
}


function deleteNews(newsClicked){
	var confirmDelete = confirm('Уверен?');
	if (confirmDelete) {
		var newsToDelete = newsClicked.parent().attr('data-newskey');
		//var deleteData = {newsID: newsToDelete, _id: userData._id, session: document.cookie};
		var deleteData = new SocketData();
		deleteData.newsID = newsToDelete;
		socket.emit('deleteNews', deleteData);
		newsClicked.parent().next().remove();
		newsClicked.parent().remove();
		newsClicked.prev().remove();
		newsClicked.remove();
	}
}

function deleteComment(comment, commentCount, id){
	//var deleteData = {commentCount: commentCount, _newsID: id, _userID: userData._id, session: document.cookie};
	var deleteData = new SocketData();
	deleteData.commentCount = commentCount;
	deleteData._newsID = id;
	socket.emit('deleteComment', deleteData);
	$(comment).parent().remove();
}



function showComments(id, clickedItem) {
	var commentFormPlace = $(clickedItem).parent();
	$(clickedItem).remove();
	if (!userData.isBanned) {
		$.ajax({
						url: '../views/commentsForm.html',
						success: function(html){
							commentFormPlace.html('<div style=\'display: none;\'>' + id + '</div>');
							commentFormPlace.append(html);
						}
					});
	}
	
	var moderatorQuery = (userData.isModerator == true) ? 1 : 0;
	var commentsUrl = ipServer + '/getcomments?newsID=' + id + '&moderatorQuery=' + moderatorQuery;
	
	$.ajax({
						url: commentsUrl,
						success: function(html){
								var fff = '[data-newskey = "' + id + '"]';
								$(fff).append(html);
						}
					});
}