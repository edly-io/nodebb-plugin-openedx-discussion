'use strict';

var EMBED_COOKIE_NAME = 'embed';

function isInIframe() {
	/**
	 * Return true if this function is called from within an iframe.
	 */
	return window.location !== window.parent.location;
}

function eraseCookie(name) {
	/**
	 * Delete a cookie named "name"
	 *
	 * Args:
	 * 		name <String>: Name of cookie to be deleted
	 */
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}


$(window).on('action:app.load', function (event, data) {
	/**
	 * When app is loaded, check if app is loaded from an iframe and if there is "embed" cookie present.
	 * IF app is not loaded from iframe and the cookie is present then
	 * delete the cookie and reload the page.
	 * ELSE do nothing.
	 */
	if (!isInIframe() && document.cookie.indexOf(EMBED_COOKIE_NAME) >= 0) {
		eraseCookie(EMBED_COOKIE_NAME);
		location.reload();
	}
});
