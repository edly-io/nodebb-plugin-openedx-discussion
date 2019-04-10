'use strict';

var jwt = require('jsonwebtoken');

var winston = require.main.require('winston');
var nbbAuthController = require.main.require('./src/controllers/authentication');
var meta = require.main.require('./src/meta');
var User = require.main.require('./src/user');


var embedControllers = module.exports;


embedControllers.embedView = function (req, res, next) {
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
			message = '[nodebb-plugin-openedx-discussion] "secret" settings is not set.\n';
			winston.error(message);
		}
		if (!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
			message += '[nodebb-plugin-openedx-discussion] "jwtCookieName" settings is not set.';
			winston.error(message);
		}
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
			try {
				nbbAuthController.doLogin(req, uid, function () {
					req.session.loginLock = true;
					res.redirect('/');
				});
			} catch (e) {
				if (e instanceof TypeError) {
					return next({
						code: 'error',
						username: user.username,
						message: 'User not found',
					});
				}
			}
		});
	});
};
