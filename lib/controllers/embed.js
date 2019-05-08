'use strict';

var async = require('async');
var nconf = require('nconf');

var winston = require.main.require('winston');

var topics = require.main.require('./src/topics');
var meta = require.main.require('./src/meta');
var privileges = require.main.require('./src/privileges');
var categories = require.main.require('./src/categories');
var pagination = require.main.require('./src/pagination');
var plugins = require.main.require('./src/plugins');
var helpers = require.main.require('./src/controllers/helpers');
var utils = require.main.require('./src/utils');
var User = require.main.require('./src/user');
var translator = require.main.require('./src/translator');
var analytics = require.main.require('./src/analytics');

const authentication = require('../../utils/authentication');

var embedControllers = module.exports;


var getCategoryView = function (cid, req, res, callback) {
	/**
	 *	Render category view which contains all topics for the corresponding category.
	 *
	 *  Args:
	 *	  cid <Number>: Category ID
	 *	  req <Object>: Request object
	 *	  res <Object>: Response object
	 *	  callback <function>: Callback function
	 */
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
					User.getSettings(req.uid, next);
				},
				rssToken: function (next) {
					User.auth.getFeedToken(req.uid, next);
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

			User.getUidByUserslug(req.query.author, next);
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
			categoryData.isEmbedView = 'asfsaf';
			res.render('category', categoryData);
		},
	], callback);
};


var getTopicView = function getTopic(req, res, callback) {
	/**
	 *	Render topic view which contains all posts for the corresponding topic.
	 *  Topic is identified by req.params.topic_id.
	 *
	 *  Args:
	 *	  req <Object>: Request object
	 *	  res <Object>: Response object
	 *	  callback <function>: Callback function
	 */
	var tid = req.params.topic_id;
	var currentPage = parseInt(req.query.page, 10) || 1;
	var pageCount = 1;
	var userPrivileges;
	var settings;
	var rssToken;

	if ((req.params.post_index && !utils.isNumber(req.params.post_index)) || !utils.isNumber(tid)) {
		return callback();
	}

	async.waterfall([
		function (next) {
			async.parallel({
				privileges: function (next) {
					privileges.topics.get(tid, req.uid, next);
				},
				settings: function (next) {
					User.getSettings(req.uid, next);
				},
				topic: function (next) {
					topics.getTopicData(tid, next);
				},
				rssToken: function (next) {
					User.auth.getFeedToken(req.uid, next);
				},
			}, next);
		},
		function (results, next) {
			if (!results.topic) {
				return callback();
			}

			userPrivileges = results.privileges;
			rssToken = results.rssToken;

			if (!userPrivileges['topics:read'] || (results.topic.deleted && !userPrivileges.view_deleted)) {
				return helpers.notAllowed(req, res);
			}

			if (!res.locals.isAPI && (!req.params.slug || results.topic.slug !== tid + '/' + req.params.slug) && (results.topic.slug && results.topic.slug !== tid + '/')) {
				var url = '/embed?topic_id=' + results.topic.tid;
				if (req.params.post_index) {
					url += '/' + req.params.post_index;
				}
				if (currentPage > 1) {
					url += '?page=' + currentPage;
				}
				return helpers.redirect(res, url);
			}

			settings = results.settings;
			var postCount = results.topic.postcount;
			pageCount = Math.max(1, Math.ceil(postCount / settings.postsPerPage));
			results.topic.postcount = postCount;

			if (utils.isNumber(req.params.post_index) && (req.params.post_index < 1 || req.params.post_index > postCount)) {
				return helpers.redirect(res, '/topic/' + req.params.topic_id + '/' + req.params.slug + (req.params.post_index > postCount ? '/' + postCount : ''));
			}

			if (settings.usePagination && (currentPage < 1 || currentPage > pageCount)) {
				return callback();
			}

			var set = 'tid:' + tid + ':posts';
			var reverse = false;
			var sort = req.query.sort || settings.topicPostSort;
			if (sort === 'newest_to_oldest') {
				reverse = true;
			} else if (sort === 'most_votes') {
				reverse = true;
				set = 'tid:' + tid + ':posts:votes';
			}

			var postIndex = 0;

			req.params.post_index = parseInt(req.params.post_index, 10) || 0;
			if (reverse && req.params.post_index === 1) {
				req.params.post_index = 0;
			}
			if (!settings.usePagination) {
				if (req.params.post_index !== 0) {
					currentPage = 1;
				}
				if (reverse) {
					postIndex = Math.max(0, postCount - (req.params.post_index || postCount) - Math.ceil(settings.postsPerPage / 2));
				} else {
					postIndex = Math.max(0, (req.params.post_index || 1) - Math.ceil(settings.postsPerPage / 2));
				}
			} else if (!req.query.page) {
				var index;
				if (reverse) {
					index = Math.max(0, postCount - (req.params.post_index || postCount) + 2);
				} else {
					index = Math.max(0, req.params.post_index) || 0;
				}

				currentPage = Math.max(1, Math.ceil(index / settings.postsPerPage));
			}

			var start = ((currentPage - 1) * settings.postsPerPage) + postIndex;
			var stop = start + settings.postsPerPage - 1;

			topics.getTopicWithPosts(results.topic, set, req.uid, start, stop, reverse, next);
		},
		function (topicData, next) {
			if (topicData.category.disabled) {
				return callback();
			}

			topics.modifyPostsByPrivilege(topicData, userPrivileges);

			plugins.fireHook('filter:controllers.topic.get', { topicData: topicData, uid: req.uid }, next);
		},
		function (data, next) {
			buildBreadcrumbs(data.topicData, next);
		},
		function (topicData) {
			topicData.privileges = userPrivileges;
			topicData.topicStaleDays = meta.config.topicStaleDays;
			topicData['reputation:disabled'] = meta.config['reputation:disabled'];
			topicData['downvote:disabled'] = meta.config['downvote:disabled'];
			topicData['feeds:disableRSS'] = meta.config['feeds:disableRSS'];
			topicData.bookmarkThreshold = meta.config.bookmarkThreshold;
			topicData.postEditDuration = meta.config.postEditDuration;
			topicData.postDeleteDuration = meta.config.postDeleteDuration;
			topicData.scrollToMyPost = settings.scrollToMyPost;
			topicData.allowMultipleBadges = meta.config.allowMultipleBadges === 1;
			topicData.rssFeedUrl = nconf.get('relative_path') + '/topic/' + topicData.tid + '.rss';
			if (req.loggedIn) {
				topicData.rssFeedUrl += '?uid=' + req.uid + '&token=' + rssToken;
			}


			topicData.postIndex = req.params.post_index;
			topicData.pagination = pagination.create(currentPage, pageCount, req.query);
			topicData.pagination.rel.forEach(function (rel) {
				rel.href = nconf.get('url') + '/topic/' + topicData.slug + rel.href;
				res.locals.linkTags.push(rel);
			});

			if (req.uid >= 0) {
				req.session.tids_viewed = req.session.tids_viewed || {};
				if (!req.session.tids_viewed[tid] || req.session.tids_viewed[tid] < Date.now() - 3600000) {
					topics.increaseViewCount(tid);
					req.session.tids_viewed[tid] = Date.now();
				}
			}

			if (req.loggedIn) {
				topics.markAsRead([tid], req.uid, function (err, markedRead) {
					if (err) {
						return winston.error(err);
					}
					if (markedRead) {
						topics.pushUnreadCount(req.uid);
						topics.markTopicNotificationsRead([tid], req.uid);
					}
				});
			}

			analytics.increment(['pageviews:byCid:' + topicData.category.cid]);
			topicData.breadcrumbs = null;
			topicData.showCategoryLink = true;
			res.render('topic', topicData);
		},
	], callback);
};
function buildBreadcrumbs(topicData, callback) {
	/**
	 *	Build an array of breadcrumbs for the provided topic.
	 *
	 *  Args:
	 *	  topicData <Object>: Topic data for which to build the breadcrumbs
	 *	  callback <function>: Callback function
	 */
	var breadcrumbs = [
		{
			text: topicData.category.name,
			url: nconf.get('relative_path') + '/category/' + topicData.category.slug,
		},
		{
			text: topicData.title,
		},
	];

	async.waterfall([
		function (next) {
			helpers.buildCategoryBreadcrumbs(topicData.category.parentCid, next);
		},
		function (crumbs, next) {
			topicData.breadcrumbs = crumbs.concat(breadcrumbs);
			next(null, topicData);
		},
	], callback);
}

var handleRedirect = function (req, res, callback) {
	/**
	 *	Redirect request to corresponding category or topic view
	 * 	depending upon the keys in req.query object.
	 *
	 *	URL parameters allowed:
	 *		category_id <Number> : Category ID
	 * 		topic_id <Number> : Topic ID
	 *
	 *	Examples:
	 *		<NodeBB_URL>/embed?category_id=1
	 *		<NodeBB_URL>/embed?topic_id=1
	 *
	 *   Args:
	 *	  	req <Object>: Request object
	 *	 	res <Object>: Response object
	 *	 	callback <function>: Callback function
	 */
	var category_id = req.query.category_id;
	var topic_id = req.query.topic_id;
	if (category_id) {
		return getCategoryView(category_id, req, res, callback);
	}
	if (topic_id) {
		req.params.topic_id = topic_id;
		return getTopicView(req, res, callback);
	}

	return callback({
		code: 'error',
		plugin: 'openedx-discussion',
		message: 'Invalid Request',
	});
};


embedControllers.embedView = function (req, res, next) {
	/**
	 *	Controller to handle the request to "/embed" endpoint. Authenticate if user is logged in by checking the JWT
	 *  Token in cookies.
	 *	Once authenticated, redirect the request to corresponding view based upon url parameters.
	 *
	 *	Examples:
	 *		<NodeBB_URL>/embed?category_id=1
	 *		<NodeBB_URL>/embed?topic_id=1
	 *
	 *   Args:
	 *	  	req <Object>: Request object
	 *	  	res <Object>: Response object
	 *	  	callback <function>: Callback function
	 */
	var meta = require.main.require('./src/meta');
	meta.settings.get('openedx-discussion', function (err, settings) {
		if (err) {
			return next({
				plugin: 'openedx-discussion',
				code: 'error',
				message: 'settings could not be loaded',
			});
		}
		var cookieName = settings.jwtCookieName;
		if (req.cookies[cookieName]) {
			authentication.loginByJwtToken(req, function (err) {
				if (err) {
					return next(err);
				}
				return handleRedirect(req, res, next);
			});
		} else {
			return next({
				code: 'error',
				plugin: 'openedx-discussion',
				message: 'user is not logged in',
			});
		}
	});
};
