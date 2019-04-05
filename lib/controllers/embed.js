'use strict';

var jwt = require('jsonwebtoken');
var async = require('async');
var nconf = require('nconf');

var winston = require.main.require('winston');
var nbbAuthController = require.main.require('./src/controllers/authentication');
var meta = require.main.require('./src/meta');
var privileges = require.main.require('./src/privileges');
var user = require.main.require('./src/user');
var categories = require.main.require('./src/categories');
var pagination = require.main.require('./src/pagination');
var helpers = require.main.require('./src/controllers/helpers');
var utils = require.main.require('./src/utils');
var User = require.main.require('./src/user');
var translator = require.main.require('./src/translator');
var analytics = require.main.require('./src/analytics');


var embedControllers = module.exports;



var getCategoryView = function (cid, req, res, callback) {
	var currentPage = parseInt(req.query.page, 10) || 1;
	var pageCount = 1;
	var userPrivileges;
	var settings;
	var rssToken;

	if ((req.params.topic_index && !utils.isNumber(req.params.topic_index)) || !utils.isNumber(cid)) {
		return callback();
	}

	var topicIndex = utils.isNumber(req.params.topic_index) ? parseInt(req.params.topic_index, 10) - 1 : 0;

	async.waterfall([
		function (next) {
			async.parallel({
				categoryData: function (next) {
					categories.getCategoryFields(cid, ['slug', 'disabled', 'topic_count'], next);
				},
				privileges: function (next) {
					privileges.categories.get(cid, req.uid, next);
				},
				userSettings: function (next) {
					user.getSettings(req.uid, next);
				},
				rssToken: function (next) {
					user.auth.getFeedToken(req.uid, next);
				},
			}, next);
		},
		function (results, next) {
			userPrivileges = results.privileges;
			rssToken = results.rssToken;

			if (!results.categoryData.slug || (results.categoryData && results.categoryData.disabled)) {
				return callback();
			}

			if (!results.privileges.read) {
				return helpers.notAllowed(req, res);
			}

			settings = results.userSettings;

			var topicCount = results.categoryData.topic_count;
			pageCount = Math.max(1, Math.ceil(topicCount / settings.topicsPerPage));

			if (topicIndex < 0 || topicIndex > Math.max(topicCount - 1, 0)) {
				return helpers.redirect(res, '/category/' + cid + '/' + req.params.slug + (topicIndex > topicCount ? '/' + topicCount : ''));
			}

			if (settings.usePagination && (currentPage < 1 || currentPage > pageCount)) {
				return callback();
			}

			if (!settings.usePagination) {
				topicIndex = Math.max(0, topicIndex - (Math.ceil(settings.topicsPerPage / 2) - 1));
			} else if (!req.query.page) {
				var index = Math.max(parseInt((topicIndex || 0), 10), 0);
				currentPage = Math.ceil((index + 1) / settings.topicsPerPage);
				topicIndex = 0;
			}

			user.getUidByUserslug(req.query.author, next);
		},
		function (targetUid, next) {
			var start = ((currentPage - 1) * settings.topicsPerPage) + topicIndex;
			var stop = start + settings.topicsPerPage - 1;
			categories.getCategoryById({
				uid: req.uid,
				cid: cid,
				start: start,
				stop: stop,
				sort: req.query.sort || settings.categoryTopicSort,
				settings: settings,
				query: req.query,
				tag: req.query.tag,
				targetUid: targetUid,
			}, next);
		},
		function (categoryData, next) {
			if (!categoryData.children.length) {
				return next(null, categoryData);
			}

			var allCategories = [];
			categories.flattenCategories(allCategories, categoryData.children);
			categories.getRecentTopicReplies(allCategories, req.uid, function (err) {
				next(err, categoryData);
			});
		},
		function (categoryData) {
			categoryData.description = translator.escape(categoryData.description);
			categoryData.privileges = userPrivileges;
			categoryData.showSelect = categoryData.privileges.editable;
			categoryData.rssFeedUrl = nconf.get('url') + '/category/' + categoryData.cid + '.rss';
			if (parseInt(req.uid, 10)) {
				categories.markAsRead([cid], req.uid);
				categoryData.rssFeedUrl += '?uid=' + req.uid + '&token=' + rssToken;
			}

			// addTags(categoryData, res);

			categoryData['feeds:disableRSS'] = meta.config['feeds:disableRSS'];
			categoryData['reputation:disabled'] = meta.config['reputation:disabled'];
			categoryData.title = translator.escape(categoryData.name);
			pageCount = Math.max(1, Math.ceil(categoryData.topic_count / settings.topicsPerPage));
			categoryData.pagination = pagination.create(currentPage, pageCount, req.query);
			categoryData.pagination.rel.forEach(function (rel) {
				rel.href = nconf.get('url') + '/category/' + categoryData.slug + rel.href;
				res.locals.linkTags.push(rel);
			});

			analytics.increment(['pageviews:byCid:' + categoryData.cid]);

			res.render('embed/category', categoryData);
		},
	], callback);
};


var handleRedirect = function (req, res, callback) {
	var cid = req.query.category_id;
	if (cid) {
		return getCategoryView(cid, req, res, callback);
	}

	return callback({
		code: 'error',
		plugin: 'openedx-discussion',
		message: 'Invalid Request',
	});
};


embedControllers.embedView = function (req, res, next) {
	if (req.user) {
		return handleRedirect(req, res, next);
	}
	meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return next({
				code: 'error',
				plugin: 'openedx-discussion',
				message: 'Settings could not be loaded',
			});
		}
		var message = '';
		if (!settings.hasOwnProperty('secret') || !settings.secret.length) {
			message = '[nodebb-plugin-openedx-discussion] "secret"';
		}
		if (!settings.hasOwnProperty('jwtCookieName') || !settings.jwtCookieName.length) {
			message += message.length ? ' and "jwtCookieName"' : 'jwtCookieName';
		}
		message += message.length ? ' setting(s) not configured.' : '';
		if (message.length) {
			return next({
				code: 'error',
				plugin: 'openedx-discussion',
				message: message,
			});
		}

		const cookieName = settings.jwtCookieName;
		const secret = settings.secret;
		const cookie = req.cookies[cookieName];

		var user;
		try {
			user = jwt.verify(cookie, secret);
		} catch (err) {
			return next(err, null);
		}
		User.getUidByUsername(user.username, function (err, uid) {
			if (err) {
				return next({
					code: 'bad-request',
					username: user.username,
					message: 'User does not exist',
				});
			}
			nbbAuthController.doLogin(req, uid, function (err) {
				if (err) {
					return next({
						code: 'bad-request',
						username: user.username,
						message: err,
					});
				}
				req.session.loginLock = true;
				res.redirect('/');
			});
		});
	});
};
