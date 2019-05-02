'use strict';

var adminControllers = module.exports;

adminControllers.renderAdminPage = function (req, res) {
	res.render('admin/plugins/openedx-discussion', {});
};

adminControllers.redirectToLogin = function (req, res) {
	req.session.returnTo = '/admin';
	req.session.save();
	res.redirect('/login?isAdmin=true');
};
