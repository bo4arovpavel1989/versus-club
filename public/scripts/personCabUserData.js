var isMasterWindowOpened = false;
var isModeratorWindowOpened = false;
var numberOfPages;
/*var screenPosition; для старой версии - когда все предложки перезагружаются после лайка*/

$(document).ready(function() {
   if(loggedIn && !userData.isBanned){ /*если юзер успешно залогинился, приветствуем его и выводим окошко для сообщений*/
	$("#welcome").append("WELCOME " + userData.login + "!");
	$.ajax({
					url: "../views/messageWindow.html",
					success: function(html){
						$("#forMessageWindow").append(html);
					}
				});
	}
	if(userData.isBanned) {
		$("#welcome").append("You`r banned, " + userData.login);
	}
	$.ajax({ /*выводим вкладки*/
				url: "../views/navpills.html",
				success: function(html){
				$("#nav-tabs").append(html);
			}
	});

	if(userData.login === '@master') {
		$('#welcomesection').prepend("<a href='#' onclick='masterWindow(); return false;' id='masterwindowstart'>Окно мастера  </a>");
	}

	if(userData.isModerator == true) {
		$('#welcomesection').prepend("<a href='#' onclick='moderatorWindow(); return false;' id='moderatorwindowstart'>Окно модератора  </a>");
	}	
});
		

socket.on('messageSentRealTime', function(data, data2){   /*разделил прием сообщения из архива и в реальном времени, т.к. они располагаются в разном порядке. В реальном добавляются ПЕРЕД существующими*/
if (!userData.isModerator) {
	$("#messagesReceived").prepend("<li class = 'message' ><div class=\'messagenick\'><a href='#' data-login=\'" + data.messageNick + "\' onclick=\'appealTo($(this)); return false\' class=\'appealTo\'>" + data.messageNick + "</a>:</div>" +
	"<div class=\'avatarMessage\' style=\"background-image: url(" + data.avatarUrl + ");\"></div>" +
	"<blockquote class=\'messagebody\'>" + data.message + "</blockquote></li>");
	} else {
		$("#messagesReceived").prepend("<li class = 'message' data-messagenick=\'" + data.messageNick + "\' data-messageID=\'" + data2 + "\'>" + 
		"<div class=\'messagenick\'><a href='#' data-login=\'" + data.messageNick + "\' onclick=\'appealTo($(this)); return false\' class=\'appealTo\'>" + data.messageNick + "</a>:</div>" +
		"<div class=\'avatarMessage\' style=\"background-image: url(" + data.avatarUrl + ");\"></div>" +
		"<blockquote class=\'messagebody\'>" + data.message + "</blockquote></li>" + 
		"<a href='#' class='deleteMessage' onclick=\'deleteMessage($(this)); return false;\'>удалить </a>" + 
		"<a href='#' class='banAuthor' onclick=\'banAuthor($(this)); return false;\'> бан/разбан</a>");
	}
});



				
socket.on('messageSent', function(data, data2){ /*принимаем сообщения (архив) от сервера*/
	if (!userData.isModerator) {
	$("#messagesReceived").append("<li class = 'message' ><div class=\'messagenick\'><a href='#' data-login=\'" + data.messageNick + "\' onclick=\'appealTo($(this)); return false\' class=\'appealTo\'>" + data.messageNick + "</a>:</div>" +
	"<div class=\'avatarMessage\' style=\"background-image: url(" + data.avatarUrl + ");\"></div>" +
	"<blockquote class=\'messagebody\'>" + data.message + "</blockquote></li>");
	} else {
		$("#messagesReceived").append("<li class = 'message' data-messagenick=\'" + data.messageNick + "\' data-messageID=\'" + data2 + "\'>" + 
		"<div class=\'messagenick\'><a href='#' data-login=\'" + data.messageNick + "\' onclick=\'appealTo($(this)); return false\' class=\'appealTo\'>" + data.messageNick + "</a>:</div>" +
		"<div class=\'avatarMessage\' style=\"background-image: url(" + data.avatarUrl + ");\"></div>" +
		"<blockquote class=\'messagebody\'>" + data.message + "</blockquote></li>" + 
		"<a href='#' class='deleteMessage' onclick=\'deleteMessage($(this)); return false;\'>удалить </a>" + 
		"<a href='#' class='banAuthor' onclick=\'banAuthor($(this)); return false;\'> бан/разбан</a>");
	}
});

socket.on('votedLoginSend', function(data){ /*принимаем от сервера список проголосовавших, если текущий юзер проголосовау уже, то скрываем выбор и выводим результат*/
	var votedOne;
	if (loggedIn) {
		userData.login = userData.login.toString();
		votedOne = data.indexOf(userData.login);
		if(votedOne != -1) {
			$("#voteResult").show(800);
		} else {
			$("#voteForm").show(200);
		}
	}
});

socket.on('votesSend', function(data){ /*принимаем результаты голосования*/
	var vote1 = 0; 
	var vote2 = 0; 
	var vote3 = 0;
	for (var i = 0; i < data.length; i++) {
		switch (data[i]) {
			case "001":
			vote1++;
			break;
			case "002":
			vote2++;
			break;
			case "003":
			vote3++;
			break;}
	}
	var sumVote = vote1 + vote2 + vote3;
	if (sumVote != 0) {
		var percV1 = (vote1 / sumVote) * 100;
		var percV2 = (vote2 / sumVote) * 100;
		var percV3 = (vote3 / sumVote) * 100;
	}
	$("#voteResult").append("<br><br><div class = \'voteresult\'><p>" + voteCandidates[0] + ": " + percV1 + "%</p>" + 
	"<div class = \'voteWholeLine\' style = '\width: 120%'\>" +
	"<div class=\'voteLine\' style = '\width:" + percV1 + "%'\></div></div>" +
	"</div><br><br>");
	$("#voteResult").append("<br><div class = \'voteresult\'><p>"+ voteCandidates[1] + ": " + percV2 + "%</p>" + 
	"<div class = \'voteWholeLine\' style = '\width: 120%'\>" +
	"<div class=\'voteLine\' style = '\width:" + percV2 + "%'\></div></div>" +
	"</div><br><br>");
	$("#voteResult").append("<br><div class = \'voteresult\'><p>" + voteCandidates[2] + ": " + percV3 + "%</p>" + 
	"<div class = \'voteWholeLine\' style = '\width: 120%'\>" +
	"<div class=\'voteLine\' style = '\width:" + percV3 + "%'\></div></div>" +
	"</div><br><br>");
});

if (!loggedIn) { /*скрываем голосование от неавторизованных*/
	$("#logoff").hide();
	$("#voteForm").hide();
	$("#voteResult").hide();
	$("#unauthorMess").append("<p>Голосование доступно только авторизованным пользователям</p>");
	
}

socket.on('proposeSend', function(data){ /*принимаем от сервера список предложек*/
	var dataToFind = "data-propose=\'" + data.propose + "\'";
	var dataToFindLogin = "data-proposelogin=\'" + data.login + "\'";
	var proposeLike = data.like;
	if (!userData.isModerator) {
		$("#proposalItems").append('<div class=\'proposalItem\'' + dataToFind + dataToFindLogin +'> Предложена пара на голосование: <div class =\'alert alert-info\'>' + 
		data.propose + '</div>' + ' ' + '<a href=\'#\' class=\'proposePlus\' onclick=\'likePropose($(this)); return false;\' ><strong>[' + data.like + ']</strong> - <span class="glyphicon glyphicon-thumbs-up"></span></a>' + '</div>');
	} else {
		$("#proposalItems").append('<div class=\'proposalItem\'' + dataToFind + dataToFindLogin +'> Предложена пара на голосование: <div class =\'alert alert-info\'>' + 
		data.propose + '</div>' + ' ' + '<a href=\'#\' class=\'proposePlus\' onclick=\'likePropose($(this)); return false;\' ><strong>[' 
		+ data.like + ']</strong> - <span class="glyphicon glyphicon-thumbs-up"></span></a>' + '</div>' + 
		'<a href=\'#\' class=\'deletePropose\' onclick=\'deletePropose($(this)); return false;\'>удалить</a>' + 
		'<a href=\'#\' class=\'banAuthor\' onclick=\'banProposeAuthor($(this)); return false;\'> бан/разбан</a><br>');
	}
	/*window.scrollTo(0, screenPosition); старая версия - когда перезагрузка всех предложек после лайка и возврат к той же точке*/
});

socket.on('newPlus', function(data, like){
	var fff = '[data-propose = "' + data + '"]';
	$(fff).find('.proposePlus').html('<strong>[' + like + ']</strong> - <span class="glyphicon glyphicon-thumbs-up"></span>');
});

socket.on('newNewsLike', function(data, like){
	var fff = '[data-newskey = "' + data + '"]';
	$(fff).find('strong').html('[' + like + ']');
});

socket.on('newsSend', function(data){
	if (!userData.isEditor) {
		$('#newsToLoad').append('<div class = \'newsItem\' data-newskey=\'' + data._id + '\'><h2 class=\'newsTitle\'>' + data.title + '</h2>' +
		'<p class = \'newsDate\'><br>' + data.date +
		'<p class= \'newsImage\'><img src =\'' + data.img + '\' alt = \'newsimage\' width=\'45%\' height=\'45%\'></p>' +
		'<p class=\'newsbody\'>' + data.body + '</p>' + 
		'<strong  style=\'float: right;\'>[' + data.likes + ']</strong>' +
		'<a href=\'#\' class=\'likeNews\' onclick=\'likeNews($(this)); return false;\' style=\'float: right; margin-right: 1%;\'><span class="glyphicon glyphicon-thumbs-up"></span></a><br></div>' +
		'<div class=\'text-center\'><a href=\'#\' class=\'showComments\' onclick=\'showComments(\"' + data._id + '\", ' + '$(this)); return false;\'>[ПОКАЗАТЬ КОММЕНТАРИИ]</a></div>');
	} else {
		$('#newsToLoad').append('<div class = \'newsItem\' data-newskey=\'' + data._id + '\'><h2 class=\'newsTitle\'>' + data.title + '</h2>' +
		'<p class = \'newsDate\'><br>' + data.date +
		'<p class= \'newsImage\'><img src =\'' + data.img + '\' alt = \'newsimage\' width=\'45%\' height=\'45%\'></p>' +
		'<p class=\'newsbody\'>' + data.body + '</p>' + 
		'<strong  style=\'float: right;\'>[' + data.likes + ']</strong>' +
		'<a href=\'#\' class=\'likeNews\' onclick=\'likeNews($(this)); return false;\' style=\'float: right; margin-right: 1%;\'><span class="glyphicon glyphicon-thumbs-up"></span></a>' +
		'<a href=\'#\' class=\'deleteNews\' onclick=\'deleteNews($(this)); return false;\'><span class="glyphicon glyphicon-trash"></span></a><br></div>' + 
		'<div class=\'text-center\'><a href=\'#\' class=\'showComments\' onclick=\'showComments(\"' + data._id + '\", ' + '$(this)); return false;\'>[ПОКАЗАТЬ КОММЕНТАРИИ]</a></div>');
	}
	$("img").error(function () {
		$(this).hide();
	});
});

socket.on('noNewsComments', function(data){
	var fff = '[data-newskey = "' + data + '"]';
	$(fff).append('<div class=\'text-center\'>КОММЕНТАРИЕВ ПОКА НЕТ</div><br>');
});

socket.on('newsCommentSent', function(comment, id, commentCount){
	var fff = '[data-newskey = "' + id + '"]';
	if (!userData.isModerator) {$(fff).append('<br><div class=\'commentItem\' data-commentCount=\'' + commentCount + '\'>' + comment.login + ': ' + comment.comment + '</div>');}
	else {
		$(fff).append('<br><div class=\'commentItem\' data-commentCount=\'' + commentCount + '\'>' + comment.login + ': ' + comment.comment + '<a href=\'#\' class=\'deleteMessage\' onclick=\'deleteComment(\$(this), "' + commentCount+'\", \"' + id + '\"); return false\'>удалить</a></div>');
	}
});





socket.on('banListSent', function(datas){
	$('#banListItems').empty();
	datas.forEach(function(data){
		$('#banListItems').append('<br><li class="banListItem"><div class=\'bannedNick\' data-messagenick=\'' + 
		data + '\'></div><div style="display: inline;"><span class="glyphicon glyphicon-user" style="margin-right: 20px;"></span>' + 
		data + '</div><a href="#" onclick="banAuthor($(this)); $(this).closest(\'li\').remove(); return false;" class="banListItemRemove"><span class="glyphicon glyphicon-remove"></span></a></li><br>');
	});
});

socket.on('banListCardinality', function(data){
	if(data !==0) 
	numberOfPages = data/10; /*banned persons per page*/
	if (numberOfPages > 1) {
		for (var pageNum = 2; pageNum <= numberOfPages; pageNum++) { /*first page always presents, so we start from the second*/
			$('.pagination').append('<li><a href=\'#\' class=\'banListPage\' onclick=\'askForBanList($(this)); return false;\'>' + pageNum + '</a></li>');
			console.log(pageNum);
		}
		if (numberOfPages > 8) {
			shortPagination();
		}
	}
});

socket.on('heIsBanned', function(data){
	$('#banListItems').empty();
	$('#banListItems').append('<br><li class="banListItem"><div class=\'bannedNick\' data-messagenick=\'' + 
		data + '\'></div><div style="display: inline;"><span class="glyphicon glyphicon-user" style="margin-right: 20px;"></span>' + 
		data + '</div><a href="#" onclick="banAuthor($(this)); $(this).closest(\'li\').remove(); return false;" class="banListItemRemove"><span class="glyphicon glyphicon-remove"></span></a></li><br>');
		$('.pagination > li.active').removeClass('active');
});

socket.on('bannedNotFound', function(){
	$('#banListItems').empty();
	$('#banListItems').append('<div><h3>Среди забаненных такого не найдено!</h3></div>');
	$('.pagination > li.active').removeClass('active');
});

function onScroll() {
  window.scrollY >= $('.closeWindow').offsetTop ? $('.closeWindow').addClass('sticky') :
                                  $('.closeWindow').removeClass('sticky');
}

function menuSticky() {
	var closeWindowPositionY = document.querySelector('.navbar').offsetTop;
	$(window).scroll(function(){										
		if(window.scrollY > closeWindowPositionY) {
			document.querySelector('.navbar').classList.add('stickyMenu', 'container');
			document.querySelector('#tabsData').classList.add('tabsDataSticky');
		}	else {
			document.querySelector('.navbar').classList.remove('stickyMenu', 'container');
			document.querySelector('#tabsData').classList.remove('tabsDataSticky');
		}									
												
	});
}
function appealTo(nickClicked) {
	$('#messageWindow').addClass('activeWindow');
	 if($('#messageForm').hasClass('hiddenwindow')) {
		$('#messageForm').removeClass('hiddenwindow');
		$('#messageForm').show(600, function(){
			$('#minimizeMessageWindow').html('<span class="glyphicon glyphicon-resize-small"></span>');
		});
	}
	var nickToAppeal = nickClicked.attr('data-login');
	var message = $('#message').val();
	message += nickToAppeal + ", ";
	$('#message').val(message);
	$('#message').focus();

}

function masterWindow() {
	if (!isMasterWindowOpened) {
	isMasterWindowOpened = true;	
	$.ajax({
					url: "../views/masterWindow.html",
					success: function(html){
						$("#forMessageWindow").append(html);
						$('#masterWindow').show(600);
					}
				});
	}
}

function moderatorWindow() {
	if (!isModeratorWindowOpened) {
	isModeratorWindowOpened = true;	
	$.ajax({
					url: "../views/moderatorWindow.html",
					success: function(html){
						$("#forMessageWindow").append(html);
						$('#moderatorWindow').show(600);
					}
				});
	}
}

function deleteMessage(messageClicked){
	var messageIDToDelete = messageClicked.prev().attr('data-messageID');
	var confirmData = {_id: userData._id, session: document.cookie};
	socket.emit('deleteMessage', messageIDToDelete, confirmData);
	messageClicked.prev().remove();
	messageClicked.next().remove();
	messageClicked.remove();
}

function deletePropose(proposeClicked){
	var proposeLoginToDelete = proposeClicked.prev().attr('data-proposelogin');
	var proposeToDelete = proposeClicked.prev().attr('data-propose');
	var deleteData = {login: proposeLoginToDelete, propose: proposeToDelete};
	var confirmData = {_id: userData._id, session: document.cookie};
	console.log(deleteData);
	socket.emit('deletePropose', deleteData, confirmData);
	proposeClicked.prev().remove();
	proposeClicked.next().remove();
	proposeClicked.remove();
}

function deleteNews(newsClicked){
	var confirmDelete = confirm('Уверен?');
	if (confirmDelete) {
		var newsToDelete = newsClicked.parent().attr('data-newskey');
		var confirmData = {_id: userData._id, session: document.cookie};
		socket.emit('deleteNews', newsToDelete, confirmData);
		newsClicked.prev().remove();
		newsClicked.remove();
	}
}

function banAuthor(messageClicked){
	var confirmData = {_id: userData._id, session: document.cookie};
	var messageNickToBan = messageClicked.prev().prev().attr('data-messagenick');
	socket.emit('banAuthor', messageNickToBan, confirmData);
}
function banProposeAuthor(proposeClicked){
	var confirmData = {_id: userData._id, session: document.cookie};
	var messageNickToBan = proposeClicked.prev().prev().attr('data-proposeLogin');
	socket.emit('banAuthor', messageNickToBan, confirmData);
}

function askForBanList(clickedPage) {
	var pageNumber = clickedPage.html();
	socket.emit('banListNeeded', pageNumber);
	$('.pagination > .active').removeClass('active');
	clickedPage.parent().addClass('active');
	shortPagination();
}
function shortPagination() {
	$('.pagination > li:not(.active)').addClass('hiddenPagination');
	$('.pagination li:first-child').removeClass('hiddenPagination');
	$('.pagination li:last-child').removeClass('hiddenPagination');
	$('.pagination > li.active').removeClass('hiddenPagination');
	$('.pagination > li.active').next().removeClass('hiddenPagination');
	$('.pagination > li.active').prev().removeClass('hiddenPagination');
	$('.pagination > li.active').next().next().removeClass('hiddenPagination');
	$('.pagination > li.active').prev().prev().removeClass('hiddenPagination');
	$('.pagination li.hiddenPagination:first-child').before(function(){
		return '<li>...</li>';
	});
	$('.pagination li.hiddenPagination:last-child').before(function(){
		return '<li>...</li>';
	});
}

function delete_cookie ()
{
  var cookie_date = new Date ( );  // Текущая дата и время
  cookie_date.setTime ( cookie_date.getTime() - 10000 );
  document.cookie += "; expires=" + cookie_date.toGMTString();
}

function deleteComment(comment, commentCount, id){
	var confirmData = {_id: userData._id, session: document.cookie};
	var deleteData = {commentCount: commentCount, _id: id};
	socket.emit('deleteComment', deleteData, confirmData);
	$(comment).parent().remove();
}



function showComments(id, clickedItem) {
	socket.emit('newsCommentsNeeded', id);
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
}

$("#logoff").click(function(){
	socket.emit('logoff', document.cookie);
	delete_cookie ();
	console.log(document.cookie);
	window.location.assign(ipServer);
});
