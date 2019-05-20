'use strict';

const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const assert = require('assert');

const { NODEBB_URL, USER, JWT_COOKIE_NAME, JWT_SECRET } = require('./config');

const nodeBBServer = supertest.agent(NODEBB_URL);

describe('NodeBB embed view test', () => {
	const user = {
		username: USER.username,
	};
	const encodedUsername = jwt.sign(user.toString(), JWT_SECRET);
	const EMBED_COOKIE_NAME = 'embed';


	it('checks that user cannot view the embed view unless logged in', done => {
		const ERROR_MESSAGE = '[[error:not-logged-in]]';
		nodeBBServer
			.get('/api/embed/')
			.expect(500)
			.expect('Content-Type', /json/)
			.end((err, res) => {
				if (err) return done(err);
				if (res.body.error === ERROR_MESSAGE) {
					done();
				} else {
					done(new Error('Wrong error message found in response'));
				}
			});
	});

	it('checks that "/embed" must be called with query paramteres', done => {
		const ERROR_MESSAGE = '[[error:invalid-search-term]]';
		nodeBBServer
			.get('/api/embed/')
			.set('Cookie', `${JWT_COOKIE_NAME}=${encodedUsername}`)
			.expect(500)
			.expect('Content-Type', /json/)
			.end((err, res) => {
				if (err) return done(err);
				if (res.body.error === ERROR_MESSAGE) {
					done();
				} else {
					done(new Error('Wrong error message found in response'));
				}
			});
	});

	it('verifies the embed category template variables for a logged-in user', done => {
		nodeBBServer
			.get('/api/category/1')
			.set('Cookie', `${JWT_COOKIE_NAME}=${encodedUsername}`)
			.set('Cookie', `${EMBED_COOKIE_NAME}=true`)
			.expect(200)
			.expect('Content-Type', /json/)
			.end((err, res) => {
				if (err) return done(err);


				assert.equal(res.body.breadcrumbs, null);
				assert.equal(res.body.isEmbedView, true);
				assert.equal(res.body.showCategoryLink, false);
				done();
			});
	});

	it('verifies the embed topic template variables for a logged-in user', done => {
		nodeBBServer
			.get('/api/topic/1')
			.set('Cookie', `${JWT_COOKIE_NAME}=${encodedUsername}`)
			.set('Cookie', `${EMBED_COOKIE_NAME}=true`)
			.expect(200)
			.expect('Content-Type', /json/)
			.end((err, res) => {
				if (err) return done(err);

				assert.equal(res.body.breadcrumbs, null);
				assert.equal(res.body.isEmbedView, true);
				assert.equal(res.body.showCategoryLink, true);
				done();
			});
	});
});
