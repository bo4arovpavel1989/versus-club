$(document).ready(function(){
	
	$("#changeUserDataForm").submit(function(e){
		var oldPass = $("#inputOldPass").val();
		var newPass = $("#inputPasswordChange2").val();
		var dataToChange = new SocketData();
		dataToChange.pass = oldPass;
		dataToChange.newpass = newPass;	
		socket.emit('changeUserData', dataToChange);
		return false;
	});	
	
	$("#changeUserEmailForm").submit(function(e){
		var newEmail = $("#inputNewEmail").val();
		//var dataToChange = {_id: userData._id, email: newEmail, session: document.cookie};
		var dataToChange = new SocketData();
		dataToChange.email = newEmail;
		socket.emit('changeUserEmail', dataToChange);
		return false;
	});
	
});

function checkPasswords() {
	var passl = document.getElementById("inputPasswordChange1");
	var pass2 = document.getElementById("inputPasswordChange2");
	if(passl.value != pass2.value)
		passl.setCustomValidity("Пароли  не совпадают. Пожалуйста, проверьте  идентичность паролей в обоих полях!");
	else
	passl.setCustomValidity("");
}	

$(function(){
			var progressBar = $('.progress-bar');
				$('#uploadAvatar').on('submit', function(e){
					$('.progress').show();
					progressBar.show();
					e.preventDefault();
					var $that = $(this),
					formData = new FormData($that.get(0));
					$.ajax({
					  url: $that.attr('action'),
					  type: $that.attr('method'),
					  contentType: false,
					  processData: false,
					  data: formData,
					  dataType: 'json',
					  xhrFields: {
									withCredentials: true
								},
					  xhr: function(){
						var xhr = $.ajaxSettings.xhr(); // получаем объект XMLHttpRequest
						xhr.upload.addEventListener('progress', function(evt){ // добавляем обработчик события progress (onprogress)
						  if(evt.lengthComputable) { // если известно количество байт
							// высчитываем процент загруженного
							var percentComplete = Math.ceil(evt.loaded / evt.total * 100);
							// устанавливаем значение в атрибут value тега <progress>
							// и это же значение альтернативным текстом для браузеров, не поддерживающих <progress>
							progressBar.attr('aria-valuenow', percentComplete);
							progressBar.css('width', percentComplete + '%');
							progressBar.html(percentComplete + "%");
							if (percentComplete == 100) {
								progressBar.html("Загружено!");
								progressBar.removeClass('progress-bar-striped');
							}
						  }
						}, false);
						return xhr;
					  },
					  success: function(){
							$('.progress').hide();
						}
					});
				});
				if(progressBar.attr('aria-valuenow') == '100') {
					$('.progress').hide();
				}
		});	