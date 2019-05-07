'use strict';

$(document).ready(function () {
	$(window).on('action:app.loggedOut', function (event, data) {
		/**
		 *	Redirect user to Open Edx logout URL to get the user logged out from Open Edx when user logs out
		 * 	from NodeBB.
		 */
		if (logoutURL) {
			window.location.href = logoutURL;
		}
	});
});
