/* eslint-disable handle-callback-err */

'use strict';

const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require.main.require('./src/user').async;

const helpers = require('@utils/helpers');

const authentication = module.exports;


const loginByJwtToken = async (req, settings, next) => {
	/**
	 * Authenticate and login user by veriying JWT token provided in request cookies.
	 * Name of cookie and "secret" to verify Token are obtained from plugin settings (configurable from admin panel).
	 *
	 * Args:
	 *	req<Object>: Request object
	 *	res<Object>: Response object
	 */

	try {
		helpers.verifySettings(settings);
	} catch (err) {
		// Required settings are not present
		return next(err);
	}

	const cookieName = settings.jwtCookieName;
	const secret = settings.secret;
	const cookie = req.cookies[cookieName];
	let user;
	try {
		user = jwt.verify(cookie, secret);
	} catch (err) {
		// Invalid secret
		return next(err);
	}

	try {
		const uid = await User.getUidByUsername(user.username);
		await helpers.nbbUserLogin(req, uid);
		req.session.loginLock = true;
		return next();
	} catch (err) {
		return next(err);
	}
};

authentication.loginByJwtToken = promisify(loginByJwtToken);
