'use strict';

var controllers = {};

var embedControllers = require('@lib/controllers/embed');
var adminControllers = require('@lib/controllers/admin');

controllers.embed = embedControllers;
controllers.adminPanel = adminControllers;

module.exports = controllers;
