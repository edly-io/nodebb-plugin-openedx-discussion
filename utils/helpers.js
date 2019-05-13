'use strict';

const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const nbbAuthController = require.main.require('./src/controllers/authentication');
const meta = require.main.require('./src/meta');
const User = require.main.require('./src/user');

const constants = require('@lib/constants');


const verifySettings = (settings) => {
	/**
	 * Verify if all required settings are configured or not.
	 *
	 * Args:
	 * 		Settings <Object>: Plugin settings object
	 * 		next <function>: Callback function
	 */
	let message = '';
	if (!settings.hasOwnProperty('secret') || !settings.secret.length) {
		message = '[' + constants.PLUGIN_ID + '] "secret"';
	}
	if (!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
		message += message.length ? ' and "jwtCookieName"' : 'jwtCookieName';
	}
	message += message.length ? ' setting(s) not configured.' : '';
	if (message.length) {
		return {
			code: '[[plugins:plugin-item.unknown-explanation]]',
			plugin: constants.PLUGIN_NAME,
			message: message,
		};
	}
	return null;
};

var verifyJwtToken = (token, secret, next) => {
	/**
	 * Verify JWT token signature with "secret" set in plugin settings.
	 *
	 * Args:
	 * 		data <Object>: object containing cookie and "secret" to verify token in cookie
	 * 		next <funciton>: Callback function
	 */
	let user;
	try {
		user = jwt.verify(token, secret);
		return next(null, user);
	} catch (err) {
		return next(err, null);
	}
};


module.exports = {
	getPluginSettings: promisify(meta.settings.get),
	verifySettings: verifySettings,
	verifyJwtToken: promisify(verifyJwtToken),
	getUidByUsername: promisify(User.getUidByUsername),
	nbbUserLogin: promisify(nbbAuthController.doLogin),
};
