'use strict';

var meta = require.main.require('./src/meta');

var authentication = require('@utils/authentication');
var constants = require('@lib/constants');
var helpers = require('@utils/helpers');

var embedControllers = module.exports;


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
	var url = req.xhr ? '/api' : '';
	if (category_id) {
		url += '/category/' + category_id;
	} else if (topic_id) {
		req.params.topic_id = topic_id;
		url += '/topic/' + topic_id;
	} else {
		return callback(new Error('[[error:invalid-search-term]]'));
	}
	return res.redirect(url);
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

	helpers.getPluginSettings(constants.PLUGIN_NAME)
		.then((settings) => {
			var cookieName = settings.jwtCookieName;
			if (req.cookies[cookieName]) {
				return authentication.loginByJwtToken(req);
			}
			throw new Error('[[error:not-logged-in]]');
		})
		.then(() => {
			res.cookie('embed', { isEmbedView: true });
			return handleRedirect(req, res, next);
		})
		.catch(err => next(err));
};
