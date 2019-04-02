'use strict';


define('admin/plugins/openedx-discussion', ['settings'], function (Settings) {
	var ACP = {};

	ACP.init = function () {
		Settings.load('openedx-discussion', $('.openedx-discussion-settings'));

		$('#save').on('click', function () {
			Settings.save('openedx-discussion', $('.openedx-discussion-settings'), function () {
				app.alert({
					type: 'success',
					alert_id: 'openedx-discussion-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function () {
						socket.emit('admin.reload');
					},
				});
			});
		});
	};

	return ACP;
});
