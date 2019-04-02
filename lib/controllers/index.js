var controllers = require.main.require('./src/controllers');

var embedControllers = require('./embed');
var adminControllers = require('./admin');

controllers.embed = embedControllers;
controllers.admin_ = adminControllers;

module.exports = controllers
