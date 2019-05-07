'use strict';

var adminControllers = module.exports;

adminControllers.renderAdminPage = function (req, res) {
	/**
	 *	Render plugin's admin page for NodeBB admin panel
	 */
	res.render('admin/plugins/openedx-discussion', {});
};
