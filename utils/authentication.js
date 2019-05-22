/* eslint-disable handle-callback-err */

'use strict';

const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const { async: User } = require.main.require('./src/user');

const helpers = require('./helpers');

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
		const cookieName = settings.jwtCookieName;
		const secret = settings.secret;
		const cookie = req.cookies[cookieName];
		const user = jwt.verify(cookie, secret);
		const uid = await User.getUidByUsername(user.username);
		await helpers.nbbUserLogin(req, uid);
		req.session.loginLock = true;
		return next();
	} catch (err) {
		return next(err);
	}
};

authentication.loginByJwtToken = promisify(loginByJwtToken);
