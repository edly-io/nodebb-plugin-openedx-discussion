'use strict';

const meta = require.main.require('./src/meta').async;

const authentication = require('@utils/authentication');
const constants = require('@lib/constants');

const embedControllers = module.exports;


const handleRedirect = (req, res, callback) => {
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
	const category_id = req.query.category_id;
	const topic_id = req.query.topic_id;
	let url = req.xhr ? '/api' : '';
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


embedControllers.embedView = (req, res, next) => {
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

	meta.settings.get(constants.PLUGIN_NAME)
		.then((settings) => {
			const cookieName = settings.jwtCookieName;
			if (req.cookies[cookieName]) {
				return authentication.loginByJwtToken(req, settings);
			}
			throw new Error('[[error:not-logged-in]]');
		})
		.then(() => {
			res.cookie('embed', true);
			return handleRedirect(req, res, next);
		})
		.catch(err => next(err));
};
