'use strict';

$(document).ready(function () {
	$(window).on('action:app.loggedOut', function (event, data) {
		if (logoutURL) {
			window.location.href = logoutURL;
		}
	});
});
