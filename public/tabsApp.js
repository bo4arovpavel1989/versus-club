$("#tabsData").empty();
$('.loader').addClass('loading');
$.ajax({
					url: 'crowdfunding.html',
					success: function(html){
						$('.loader').removeClass('loading');
						$("#tabsData").empty();
						$("#tabsData").append(html);
					}
				});

$(".tab").click(function(){ /*переключение вкладок*/
	var clickedTab = $(this);
	if (!$(this).parent().hasClass('active')) {
		$('.active').removeClass("active");
		$(this).parent().addClass("active");
		var targetFile = $(this).html() + ".html";
		$("#tabsData").empty();
		$('.loader').addClass('loading');
		$.ajax({
					url: targetFile,
					success: function(html){
						$('.loader').removeClass('loading');
						$("#tabsData").append(html);
						$(".navbar-collapse").removeClass("in");
						closeWindowSticky(); /*функция залипания крестика здесь, чтоб работала ссылка на его класс, т.к. он присутствует только в табсдатах*/
					}
				});
	}			
});

if(userData.isModerator) {
	$('#banListCall').show();
}
