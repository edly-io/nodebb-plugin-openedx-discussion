"use strict";

var winston = module.parent.require('winston');

var nbbAuthController = require.main.require('./src/controllers/authentication');
var utils = require('../../utils');
var nconf = require('nconf');
var jwt = require('jsonwebtoken');
var meta = require.main.require('./src/meta');


var embedControllers = module.exports;

embedControllers.embedView = function (req, res, next) {
	var temp = meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return next({
				code: 'error',
				plugin: 'openedx-discussion',
				message: 'Settings could not be loaded'
			});
		}
		if (!settings.hasOwnProperty('secret') || !settings.secret.length ||
			!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
			const message = 'openedx-discussion is not configured correctly.'
			winston.error(message);
			return next({
				code: 'error',
				plugin: 'openedx-discussion',
				message: message
			});
		}

		const cookieName = settings.jwtCookieName;
		const secret = settings.secret;
		const cookie = req.cookies[cookieName];

		var user;
		try {
			user = jwt.verify(cookie, secret)
		} catch (err) {
			return next(err, null);
		}
		utils.usernameSearch(user.username, function (err, data) {
			if (err || !data.users.length) {
				return next({
					code: "error",
					username: user.username,
					message: err ? err : "User not found"
				});
			}

			try {
				var uid = data.users[0].uid;
				nbbAuthController.doLogin(req, uid, function () {
					req.session.loginLock = true;
					res.redirect('/');
				});
			}
			catch (e) {
				if (e instanceof TypeError) {
					return next({
						code: "error",
						username: username,
						message: "User not found"
					});
				}
			}
		});
	})
};
