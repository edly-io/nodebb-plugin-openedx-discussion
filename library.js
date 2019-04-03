'use strict';

const controllers = require('./lib/controllers');

const plugin = {};


plugin.init = function (params, callback) {
	const router = params.router;
	const hostMiddleware = params.middleware;


	router.get('/admin/plugins/openedx-discussion', hostMiddleware.admin.buildHeader, controllers.admin_.renderAdminPage);
	router.get('/api/admin/plugins/openedx-discussion', controllers.admin_.renderAdminPage);

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

module.exports = plugin;
