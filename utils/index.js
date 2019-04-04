'use strict';

var User = require.main.require('./src/user');
var utils = module.exports;

// gets a User uid from username, returns only data with only 1 user uid
utils.uidByUsername = function (username, callback) {
	User.getUidByUsername(username, function (err, data) {
		if (err) {
			return callback(
				{
					code: 'bad-request',
					username: username,
					message: 'User does not exist',
				},
				data
			);
		}
		return callback(null, data);
	});
};
