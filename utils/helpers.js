'use strict';

const { promisify } = require('util');

const nbbAuthController = require.main.require('./src/controllers/authentication');

const constants = require('@lib/constants');


const verifySettings = settings => {
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

module.exports = {
	verifySettings: verifySettings,
	nbbUserLogin: promisify(nbbAuthController.doLogin),
};
