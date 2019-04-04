'use strict';

var jwt = require('jsonwebtoken');

var winston = module.parent.require('winston');
var nbbAuthController = require.main.require('./src/controllers/authentication');
var meta = require.main.require('./src/meta');

var utils = require('../../utils');


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
		if (!settings.hasOwnProperty('secret') || !settings.secret.length ||
			!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
			const message = 'openedx-discussion is not configured correctly.';
			winston.error(message);
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
		utils.uidByUsername(user.username, function (err, uid) {
			if (err) {
				return next(err, uid);
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
