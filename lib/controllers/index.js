'use strict';

const controllers = {};

const embedControllers = require('@lib/controllers/embed');
const adminControllers = require('@lib/controllers/admin');

controllers.embed = embedControllers;
controllers.adminPanel = adminControllers;

module.exports = controllers;
