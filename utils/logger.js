'use strict';

const winston = require('winston');


const ERROR_LOG_FILE_PATH = 'logs/error.log';
const LOG_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Logger to log all errors into `logs/error.log` file.
 */
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp({
			format: LOG_TIME_FORMAT,
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.simple()
	),
	transports: [
		new winston.transports.File({ filename: ERROR_LOG_FILE_PATH, level: 'error' }),
	],
});

module.exports = logger;
