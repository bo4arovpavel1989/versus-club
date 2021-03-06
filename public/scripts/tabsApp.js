﻿(function(window){
	var userData = window.userData || {};
	$(document).ready(function(){
		
		var closeTab = function(){
			$("#tabsData").empty();
			$('.loader').addClass('loading');
			$.ajax({
					url: '../views/crowdfunding.html',
					success: function(html){
						$('.loader').removeClass('loading');
						$("#tabsData").hide();
						$("#tabsData").addClass('nopadding');
						$("#tabsData").append(html);
						$("#tabsData").fadeIn(600);
					}
				});
		}
		
		window.closeTab = closeTab;
		
		closeTab();
						
		if(userData.isModerator) {
			$('#banListCall').show();
		}
		
		$(".tab").click(function(){ /*переключение вкладок*/
			var clickedTab = $(this);
			if (!$(this).parent().hasClass('active')) {
				$('.active').removeClass("active");
				$(this).parent().addClass("active");
				var targetFile = '../views/' + $(this).html() + ".html";
				$("#tabsData").removeClass('nopadding');
				$("#tabsData").empty();
				$('.loader').addClass('loading');
				$(document).off();
				$.ajax({
					url: targetFile,
					success: function(html){
								$('.loader').removeClass('loading');
								$("#tabsData").append(html);
								$(".navbar-collapse").removeClass("in");
								window.menuSticky();
							}
				});
			}			
		});

	});								
})(window);
