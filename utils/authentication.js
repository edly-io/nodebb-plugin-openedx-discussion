'use strict';

var jwt = require('jsonwebtoken');

var User = require.main.require('./src/user');
var meta = require.main.require('./src/meta');
var nbbAuthController = require.main.require('./src/controllers/authentication');


var authentication = module.exports;


authentication.loginByJwtToken = function (req, next) {
	meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return next({
				code: 'error',
				plugin: 'openedx-discussion',
				message: 'Settings could not be loaded',
			});
		}
		var message = '';
		if (!settings.hasOwnProperty('secret') || !settings.secret.length) {
			message = '[nodebb-plugin-openedx-discussion] "secret"';
		}
		if (!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
			message += message.length ? ' and "jwtCookieName"' : 'jwtCookieName';
		}
		message += message.length ? ' setting(s) not configured.' : '';
		if (message.length) {
			return next({
				code: 'error',
				plugin: 'openedx-discussion',
				message: message,
			});
		}

		const cookieName = settings.jwtCookieName;
		const secret = settings.secret;
		const cookie = req.cookies[cookieName];

		var user;
		try {
			user = jwt.verify(cookie, secret);
		} catch (err) {
			return next(err, null);
		}
		User.getUidByUsername(user.username, function (err, uid) {
			if (err) {
				return next({
					code: 'bad-request',
					username: user.username,
					message: 'User does not exist',
				});
			}
			nbbAuthController.doLogin(req, uid, function (err) {
				if (err) {
					return next({
						code: 'bad-request',
						username: user.username,
						message: err,
					});
				}
				req.session.loginLock = true;
				return next();
			});
		});
	});
};
