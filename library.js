'use strict';

const meta = require.main.require('./src/meta');

const controllers = require('./lib/controllers');
const authentication = require('./utils/authentication');


const plugin = {};


plugin.init = function (params, callback) {
	const router = params.router;
	const hostMiddleware = params.middleware;


	router.get('/admin/plugins/openedx-discussion', hostMiddleware.admin.buildHeader, controllers.adminPanel.renderAdminPage);
	router.get('/api/admin/plugins/openedx-discussion', controllers.adminPanel.renderAdminPage);

	router.get('/embed', hostMiddleware.buildHeader, controllers.embed.embedView);
	router.get('/api/embed', controllers.embed.embedView);

	router.get('/adminlogin', hostMiddleware.buildHeader, controllers.adminPanel.redirectToLogin);
	router.get('/api/adminlogin', controllers.adminPanel.redirectToLogin);

	callback();
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/openedx-discussion',
		icon: 'fa-user-secret',
		name: 'Openedx Discussion',
	});

	callback(null, header);
};

plugin.addCustomParameters = function (params, callback) {
	params.templateValues.isEmbedView = params.req.path.startsWith('/embed');
	meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return callback({
				code: 'error',
				plugin: 'openedx-discussion',
				message: 'Settings could not be loaded',
			});
		}
		params.templateValues.loginURL = settings.loginURL;
		params.templateValues.registrationURL = settings.registrationURL;
		params.templateValues.logoutURL = settings.logoutURL;
		callback(null, params);
	});
};

plugin.authenticateSession = function (req, res, callback) {
	var originalUid = req.uid;
	meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return callback({
				code: 'error',
				plugin: 'openedx-discussion',
				message: 'Settings could not be loaded',
			});
		}

		if (req.path === '/login' && settings.loginURL && !req.query.isAdmin) {
			return res.redirect(settings.loginURL);
		} else if (req.path === '/register' && settings.registrationURL) {
			return res.redirect(settings.registrationURL);
		}

		var cookieName = settings.jwtCookieName;
		if (req.cookies[cookieName]) {
			authentication.loginByJwtToken(req, function (err) {
				if (err) {
					return callback(err);
				}
				if (req.uid === originalUid) {
					return callback();
				}
				return res.redirect(req.originalUrl);
			});
		} else if (req.user && req.user.uid !== 1) {
			req.logout();
			return res.redirect('/login');
		} else {
			return callback();
		}
	});
};


plugin.cleanSession = function (params, callback) {
	meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return callback({
				code: 'error',
				plugin: 'openedx-discussion',
				message: 'Settings could not be loaded',
			});
		}
		if (settings.jwtCookieName) {
			params.res.clearCookie(settings.jwtCookieName);
		}
		callback();
	});
};

module.exports = plugin;
