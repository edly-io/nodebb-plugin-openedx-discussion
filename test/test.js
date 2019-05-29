'use strict';

const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const assert = require('assert');

const { NODEBB_URL, USER, JWT_COOKIE_NAME, JWT_SECRET } = require('./config');


const nodeBBServer = supertest(NODEBB_URL);


describe('NodeBB embed view test', () => {
	const user = {
		username: USER.username,
	};
	const encodedUsername = jwt.sign(user.toString(), JWT_SECRET);
	const EMBED_COOKIE_NAME = 'embed';


	it('verifies the "embed" cookie in response of request to "/embed" endpoint', done => {
		const EMBED_COOKIE = 'embed=true;';
		nodeBBServer
			.get('/embed')
			.query({ category_id: 1 })
			.set('Cookie', `${JWT_COOKIE_NAME}=${encodedUsername}`)
			.expect(302)
			.expect('Content-Type', /text\/plain/)
			.end((err, res) => {
				if (err) return done(err);
				const cookieStatus = res.headers['set-cookie'].some(cookie => cookie.indexOf(EMBED_COOKIE) >= 0) ?
					null : new Error('embed cookie not found');
				done(cookieStatus);
			});
	});

	it('checks that user cannot view the embed view unless logged in', done => {
		const ERROR_MESSAGE = '[[error:not-logged-in]]';
		nodeBBServer
			.get('/api/embed/')
			.expect(500)
			.expect('Content-Type', /json/)
			.end((err, res) => {
				if (err) return done(err);
				assert.equal(res.body.error, ERROR_MESSAGE);
				done();
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
				assert.equal(res.body.error, ERROR_MESSAGE);
				done();
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
