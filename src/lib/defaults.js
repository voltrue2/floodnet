'use strict';

var NAME = '[floodnet] ';
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;

exports.HELLO = 'hello';
exports.BYE = 'bye';
exports.HEARTBEAT = 'heartbeat';
exports.ECONNREFUSED = 'ECONNREFUSED';

exports.event = new EventEmitter();

/*
options: {
	parser: [javascript]
	return_buffers: [bool] // default to false: returns buffer all commands
	detect_buffers: [bool] // default to false: returns buffer per command
	socket_nodelay: [bool] // defaults to true: if set to false, it will not call setNoDelay() on the TCP stream resulting in more throughput at the cost of more latency
	socket_keepalive: [bool] // defaults to true
	no_ready_check: [bool] // defaults to false
	enable_offline_queue: [bool] // defaults to true
	retry_max_delay: [number] // defaults to null: provided in milliseconds
	connet_timeout: [number] // defaults to false: provided in milliseconds
	max_attemps: [number] // defaults to null
	auth_pass: [string] // defaults to null
	family: [string] // defaults to IPv4
}
*/
exports.config = {
	host: '127.0.0.1',
	port: 6379,
	prefix: '__floodnet__',
	reconnect: true,
	heartbeatInterval: 0,
	logger: null,
	options: null
};

exports.id = uuid.v4();

exports.log = function () {

	if (exports.config.logger) {
		for (var key in arguments) {
			exports.config.logger.info(arguments[key]);
		}
	}

	if (!exports.config.debug) {
		return;
	}

	for (var i in arguments) {
		var arg = NAME + arguments[i];
		console.log(arg);
	}
};

exports.error = function () {

	if (exports.config.logger) {
		for (var key in arguments) {
			exports.config.logger.error(arguments[key]);
		}
	}

	if (!exports.config.debug) {
		return;
	}

	for (var i in arguments) {
		var arg = NAME + arguments[i];
		console.error(arg);
	}
};
