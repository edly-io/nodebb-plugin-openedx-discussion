'use strict';

var EMBED_COOKIE_NAME = 'embed';

function isInIframe() {
	return window.location !== window.parent.location;
}

function eraseCookie(name) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}


$(window).on('action:app.load', function (event, data) {
	if (!isInIframe() && document.cookie.indexOf(EMBED_COOKIE_NAME) >= 0) {
		eraseCookie(EMBED_COOKIE_NAME);
		location.reload();
	}
});
