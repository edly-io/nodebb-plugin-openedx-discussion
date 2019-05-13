'use strict';

const adminControllers = module.exports;

adminControllers.renderAdminPage = function (req, res) {
	/**
	 *	Render plugin's admin page for NodeBB admin panel
	 *
	 *	Args:
	 * 		req <Object>: Request object
	 * 		res <Object>: Response object
	 */
	res.render('admin/plugins/openedx-discussion', {});
};
