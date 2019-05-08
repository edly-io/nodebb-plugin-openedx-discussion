'use strict';

$(document).ready(function () {
	$(window).on('action:app.loggedOut', function (event, data) {
		/**
		 *	Redirect user to Open Edx logout URL to get the user logged out from Open Edx when user logs out
		 * 	from NodeBB.
		 *
		 *	Args:
		 *		event <Object>: Object containing event information
		 *		data <Object>: Response data from the server for the action performed.
		 *
		 */
		if (logoutURL) {
			window.location.href = logoutURL;
		}
	});
});
