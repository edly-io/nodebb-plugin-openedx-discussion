'use strict';

var { promisify } = require('util');
var jwt = require('jsonwebtoken');

var nbbAuthController = require.main.require('./src/controllers/authentication');
var meta = require.main.require('./src/meta');
var User = require.main.require('./src/user');

var constants = require('@lib/constants');


var verifySettings = function (settings, next) {
	/**
	 * Verify if all required settings are configured or not.
	 *
	 * Args:
	 * 		Settings <Object>: Plugin settings object
	 * 		next <function>: Callback function
	 */
	var message = '';
	if (!settings.hasOwnProperty('secret') || !settings.secret.length) {
		message = '[' + constants.PLUGIN_ID + '] "secret"';
	}
	if (!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
		message += message.length ? ' and "jwtCookieName"' : 'jwtCookieName';
	}
	message += message.length ? ' setting(s) not configured.' : '';
	if (message.length) {
		return next({
			code: '[[plugins:plugin-item.unknown-explanation]]',
			plugin: constants.PLUGIN_NAME,
			message: message,
		});
	}
	return (null, settings);
};

var verifyUserCookie = function (data, next) {
	/**
	 * Verify JWT token signature with "secret" set in plugin settings.
	 *
	 * Args:
	 * 		data <Object>: object containing cookie and "secret" to verify token in cookie
	 * 		next <funciton>: Callback function
	 */
	var user;
	try {
		user = jwt.verify(data.cookie, data.secret);
		return next(null, user);
	} catch (err) {
		return next(err, null);
	}
};


module.exports = {
	getPluginSettings: promisify(meta.settings.get),
	verifySettings: verifySettings,
	verifyUserCookie: promisify(verifyUserCookie),
	getUidByUsername: promisify(User.getUidByUsername),
	nbbUserLogin: promisify(nbbAuthController.doLogin),
};
