/* eslint-disable handle-callback-err */

'use strict';

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require.main.require('./src/user');
const meta = require.main.require('./src/meta');
const nbbAuthController = require.main.require('./src/controllers/authentication');

const constants = require('@lib/constants');
const helpers = require('@utils/helpers');

const authentication = module.exports;


const loginByJwtToken = (req, settings, next) => {
	/**
	 * Authenticate and login user by veriying JWT token provided in request cookies.
	 * Name of cookie and "secret" to verify Token are obtained from plugin settings (configurable from admin panel).
	 *
	 * Args:
	 *	req<Object>: Request object
	 *	res<Object>: Response object
	 */

	const err = helpers.verifySettings(settings);
	if (err) {
		return next(err);
	}

	const cookieName = settings.jwtCookieName;
	const secret = settings.secret;
	const cookie = req.cookies[cookieName];
	helpers.verifyJwtToken(cookie, secret)
		.then(user => helpers.getUidByUsername(user.username))
		.then(uid => helpers.nbbUserLogin(req, uid))
		.then(() => {
			req.session.loginLock = true;
			return next();
		})
		.catch(err => next(err));
};

authentication.loginByJwtToken = promisify(loginByJwtToken);
