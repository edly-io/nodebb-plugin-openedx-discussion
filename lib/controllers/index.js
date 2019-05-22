'use strict';

const controllers = {};

const embedControllers = require('./embed');
const adminControllers = require('./admin');

controllers.embed = embedControllers;
controllers.adminPanel = adminControllers;

module.exports = controllers;
