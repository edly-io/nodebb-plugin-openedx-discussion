/* eslint-disable handle-callback-err */

'use strict';

var jwt = require('jsonwebtoken');
var { promisify } = require('util');
var User = require.main.require('./src/user');
var meta = require.main.require('./src/meta');
var nbbAuthController = require.main.require('./src/controllers/authentication');

var constants = require('@lib/constants');
var helpers = require('@utils/helpers');

var authentication = module.exports;


var loginByJwtToken = function (req, next) {
	/**
	 * Authenticate and login user by veriying JWT token provided in request cookies.
	 * Name of cookie and "secret" to verify Token are obtained from plugin settings (configurable from admin panel).
	 *
	 * Args:
	 *	req<Object>: Request object
	 *	res<Object>: Response object
	 */

	helpers.getPluginSettings(constants.PLUGIN_NAME)
		.then(settings => helpers.verifySettings(settings))
		.then((settings) => {
			var cookieName = settings.jwtCookieName;
			var secret = settings.secret;
			var cookie = req.cookies[cookieName];
			return helpers.verifyUserCookie({ secret, cookie });
		})
		.then(user => helpers.getUidByUsername(user.username))
		.then(uid => helpers.nbbUserLogin(req, uid))
		.then(() => {
			req.session.loginLock = true;
			return next();
		})
		.catch(err => next(err));
};

authentication.loginByJwtToken = promisify(loginByJwtToken);
