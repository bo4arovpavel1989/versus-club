$(document).ready(function(){
	$("#tabsData").empty();
	$('.loader').addClass('loading');
	$.ajax({
						url: '../views/crowdfunding.html',
						success: function(html){
							$('.loader').removeClass('loading');
							$("#tabsData").empty();
							$("#tabsData").append(html);
						}
					});

					
	if(userData.isModerator) {
		$('#banListCall').show();
	}
	
	$(".tab").click(function(){ /*переключение вкладок*/
		var clickedTab = $(this);
		if (!$(this).parent().hasClass('active')) {
			$('.active').removeClass("active");
			$(this).parent().addClass("active");
			var targetFile = '../views/' + $(this).html() + ".html";
			$("#tabsData").empty();
			$('.loader').addClass('loading');
			$.ajax({
				url: targetFile,
				success: function(html){
							$('.loader').removeClass('loading');
							$("#tabsData").append(html);
							$(".navbar-collapse").removeClass("in");
							menuSticky();
						}
			});
		}			
	});

});				
				

