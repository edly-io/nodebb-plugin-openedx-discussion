'use strict';

var meta = require.main.require('./src/meta');

var controllers = require('./lib/controllers');
var authentication = require('./utils/authentication');

var constants = require('./lib/constans');

var plugin = {};


plugin.init = function (params, callback) {
	var router = params.router;
	var hostMiddleware = params.middleware;


	router.get('/admin/plugins/openedx-discussion', hostMiddleware.admin.buildHeader, controllers.adminPanel.renderAdminPage);
	router.get('/api/admin/plugins/openedx-discussion', controllers.adminPanel.renderAdminPage);

	router.get('/embed', hostMiddleware.buildHeader, controllers.embed.embedView);
	router.get('/api/embed', controllers.embed.embedView);

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

plugin.addHeaderVariables = function (params, callback) {
	if (params.req.cookies.embed && params.req.cookies.embed.isEmbedView) {
		params.templateValues.isEmbedView = true;
	}
	meta.settings.get(constants.pluginName, function (err, settings) {
		if (err) {
			return callback({
				plugin: constants.pluginName,
				message: '[[plugins:plugin-item.unknown-explanation]]',
			});
		}
		params.templateValues.loginURL = settings.loginURL;
		params.templateValues.registrationURL = settings.registrationURL;
		params.templateValues.logoutURL = settings.logoutURL;
		return callback(null, params);
	});
};

plugin.authenticateSession = function (req, res, callback) {
	var originalUid = req.uid;
	meta.settings.get(constants.pluginName, function (err, settings) {
		if (err) {
			return callback({
				plugin: constants.pluginName,
				message: '[[plugins:plugin-item.unknown-explanation]]',
			});
		}

		if (req.path === '/login' && settings.loginURL && req.session.returnTo !== '/admin') {
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
				return res.redirect(req.originalUrl + '?isFromEmbed=' + req.query.isFromEmbed);
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
	meta.settings.get(constants.pluginName, function (err, settings) {
		if (err) {
			return callback({
				code: 'error',
				plugin: constants.pluginName,
				message: 'Settings could not be loaded',
			});
		}
		if (settings.jwtCookieName) {
			params.res.clearCookie(settings.jwtCookieName);
		}
		callback();
	});
};

plugin.addTopicViewVariabels = function (data, callback) {
	if (data.req.cookies.embed && data.req.cookies.embed.isEmbedView) {
		data.templateData.breadcrumbs = null;
		data.templateData.showCategoryLink = true;
		data.templateData.hideFooter = true;
	}
	callback(null, data);
};

plugin.addCategoryViewVariables = function (data, callback) {
	if (data.req.cookies.embed && data.req.cookies.embed.isEmbedView) {
		data.templateData.breadcrumbs = null;
		data.templateData.showCategoryLink = false;
		data.templateData.hideFooter = true;
	}
	callback(null, data);
};


module.exports = plugin;
