var isMasterWindowOpened = false;
var isModeratorWindowOpened = false;
var numberOfPages;
startPersonCab();
session = document.cookie;

 function SocketData() {
	 this._id = userData._id;
	 this.session = session;
 }
 
 
/*var screenPosition; для старой версии - когда все предложки перезагружаются после лайка*/

function startPersonCab() {
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

function delete_cookie ()
{
  var cookie_date = new Date ( );  // Текущая дата и время
  cookie_date.setTime ( cookie_date.getTime() - 10000 );
  document.cookie += "; expires=" + cookie_date.toGMTString();
}




