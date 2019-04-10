'use strict';

var controllers = {};

var embedControllers = require('./embed');
var adminControllers = require('./admin');

controllers.embed = embedControllers;
controllers.adminPanel = adminControllers;

module.exports = controllers;
