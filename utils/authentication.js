'use strict';

var jwt = require('jsonwebtoken');

var User = require.main.require('./src/user');
var meta = require.main.require('./src/meta');
var nbbAuthController = require.main.require('./src/controllers/authentication');

var constants = require('@lib/constans');

var authentication = module.exports;


authentication.loginByJwtToken = function (req, next) {
	/**
	 * Authenticate and login user by veriying JWT token provided in request cookies.
	 * Name of cookie and "secret" to verify Token are obtained from plugin settings (configurable from admin panel).
	 *
	 * Args:
	 *	req<Object>: Request object
	 *	res<Object>: Response object
	 */

	meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return next({
				plugin: constants.pluginName,
				message: '[[plugins:plugin-item.unknown-explanation]]',
			});
		}
		var message = '';
		if (!settings.hasOwnProperty('secret') || !settings.secret.length) {
			message = '[' + constants.pluginID + '] "secret"';
		}
		if (!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
			message += message.length ? ' and "jwtCookieName"' : 'jwtCookieName';
		}
		message += message.length ? ' setting(s) not configured.' : '';
		if (message.length) {
			return next({
				code: '[[plugins:plugin-item.unknown-explanation]]',
				plugin: constants.pluginName,
				message: message,
			});
		}

		var cookieName = settings.jwtCookieName;
		var secret = settings.secret;
		var cookie = req.cookies[cookieName];

		var user;
		try {
			user = jwt.verify(cookie, secret);
		} catch (err) {
			return next(err, null);
		}
		User.getUidByUsername(user.username, function (err, uid) {
			if (err) {
				return next(new Error('[[error:invalid-uid]]'));
			}
			nbbAuthController.doLogin(req, uid, function (err) {
				if (err) {
					return next({
						code: '[[error:invalid-login-credentials]]',
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
