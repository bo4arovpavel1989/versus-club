(function(window){
	var SocketData=window.SocketData;
	var socket = window.socket;
	socket.emit('banListPaginationNeeded');
	startBanlist();

	function startBanlist(){
		$(document).ready(function(){
			
			$.ajax({
					url: ipServer + '/getbanlist?page=1',
					dataType: 'html',
					success: function(html){
						$('#banListItems').empty();
						$('#banListItems').append(html);
					}
			});	
			
			$("#searchBanned").submit(function(e){
				var nickToSearch = $("#search").val();
				searchBannedUrl = ipServer + '/searchbanned?login=' + nickToSearch;
				$.ajax({
					url: searchBannedUrl,
					dataType: 'html',
					success: function(html){
						$('#banListItems').empty();
						$('#banListItems').append(html);
					}
				});	
				return false;
			});
			
		});
	}

	function askForBanList(clickedPage) {
		var pageNumber = clickedPage.html();
		var banlistUrl = ipServer + '/getbanlist?page=' + pageNumber;	
		$.ajax({
				url: banlistUrl,
				dataType: 'html',
				success: function(html){
					$('#banListItems').empty();
					$('#banListItems').append(html);
				}
		});	
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

	window.banAuthor = window.banAuthor || function (messageClicked){
		var messageNickToBan = messageClicked.prev().prev().attr('data-messagenick');
		//var banData = {_id: userData._id, session: document.cookie, messageNickToBan: messageNickToBan};
		var banData = new SocketData();
		banData.messageNickToBan = messageNickToBan;
		socket.emit('banAuthor', banData);
	}
})(window);
	