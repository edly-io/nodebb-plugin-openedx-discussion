"use strict";

var User = require.main.require('./src/user');
var utils = module.exports;

// gets a User object from username, returns only data with only 1 user object
// which matches the username param exactly
utils.usernameSearch = function(username, callback) {
    User.search(
        {
            query: username
        },
        function(err, data) {
            if (err) {
                return callback(err, data);
            } else if (data.matchCount === 0) {
                return callback(
                    {
                        code: "bad-request",
                        message: "User does not exist"
                    },
                    data
                );
            } else if (data.matchCount > 1) {
                data.matchCount = 1;
                data.pageCount = 1;
                data.users = data.users.filter(function(current) {
                    return current.username === username;
                });
            }
            return callback(null, data);
        }
    );
};
