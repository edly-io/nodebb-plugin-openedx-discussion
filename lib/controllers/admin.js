'use strict';

adminControllers = module.exports;

adminControllers.renderAdminPage = function (req, res) {
	res.render('admin/plugins/openedx-discussion', {});
};
