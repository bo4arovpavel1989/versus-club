﻿var isMasterWindowOpened = false;
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
	
	$("#logoff").click(function(){
		socket.emit('logoff', document.cookie);
		delete_cookie ();
		console.log(document.cookie);
		window.location.assign(ipServer);
	});
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


socket.on('newPlus', function(data, like){
	var fff = '[data-propose = "' + data + '"]';
	$(fff).find('.proposePlus').html('<strong>[' + like + ']</strong> - <span class="glyphicon glyphicon-thumbs-up"></span>');
});

socket.on('newNewsLike', function(data, like){
	var fff = '[data-newskey = "' + data + '"]';
	$(fff).find('strong').html('[' + like + ']');
});

socket.on('banListCardinality', function(data){
	if(data !==0) 
	numberOfPages = data/10; /*banned persons per page*/
	numberOfPages = Math.ceil(numberOfPages);
	if (numberOfPages > 1) {
		for (var pageNum = 2; pageNum <= numberOfPages; pageNum++) { /*first page always presents, so we start from the second*/
			$('.pagination').append('<li><a href=\'#\' class=\'banListPage\' onclick=\'askForBanList($(this)); return false;\'>' + pageNum + '</a></li>');
		}
		if (numberOfPages > 8) {
			shortPagination();
		}
	}
});

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

function delete_cookie ()
{
  var cookie_date = new Date ( );  // Текущая дата и время
  cookie_date.setTime ( cookie_date.getTime() - 10000 );
  document.cookie += "; expires=" + cookie_date.toGMTString();
}




