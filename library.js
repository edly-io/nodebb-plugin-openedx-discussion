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

plugin.addEmbedChecks = function (params, callback) {
	params.templateValues.isEmbedView = params.req.path.startsWith('/embed');
	callback(null, params);
};

plugin.authenticateSession = function (req, res, callback) {
	if (!req.user) {
		meta.settings.get('openedx-discussion', function (err, settings) {
			if (err) {
				return callback({
					code: 'error',
					plugin: 'openedx-discussion',
					message: 'Settings could not be loaded',
				});
			}
			var cookieName = settings.jwtCookieName;
			if (req.cookies[cookieName]) {
				authentication.loginByJwtToken(req, function (err) {
					if (err) {
						return callback(err);
					}
				});
			}
		});
	}
	return callback();
};


module.exports = plugin;
