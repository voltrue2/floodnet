'use strict';

var EventEmitter = require('events').EventEmitter;
var redis = require('redis');
var defaults = require('./src/lib/defaults');
var pub = require('./src/pub');
var sub = require('./src/sub');

var HELLO = 'hello';
var BYE = 'bye';

module.exports = new EventEmitter();

module.exports.setup = function (config, cb) {
	
	if (config) {
		for (var key in config) {
			if (!defaults.config.hasOwnProperty(key)) {
				defaults.config[key] = config[key];
			}
		}
	}

	if (defaults.config.debug) {
		redis.debug_mode = defaults.config.debug;
	}

	defaults.log('setting up [ID: ' + defaults.id + ']');

	pub.setup(function (error) {
		if (error) {
			defaults.log(error);
			return cb(error);
		}

		defaults.log('publisher setup [done]');

		sub.setup(function (error2) {
			if (error2) {
				defaults.log(error2);
				return cb(error2);
			}

			defaults.log('subscriber setup [done]');
			
			cb();
		});
	});	
};

module.exports.id = function () {
	return defaults.id;
};

module.exports.subscribe = function (channel, cb) {
	// subscribe to a channel
	sub.subscribe(channel, cb);
	// announce its subscription to the others in the channel
	module.exports.publish(channel, HELLO);
};

module.exports.unsubscribe = function (channel) {
	// unsubscribe from a channel
	sub.unsubscribe(channel);
	// announce its unsubscription to the others in the channel
	module.exports.publish(channel, BYE);
};

module.exports.publish = function (channel, data) {
	pub.publish(channel, data);
};

module.exports.exit = function (cb) {
	pub.exit(function () {
		sub.exit(cb);
	});
};

defaults.event.on('end', function (type) {
	module.exports.emit('end', type);
});

defaults.event.on('connect', function (type) {
	module.exports.emit('connect', type);
});

defaults.event.on('error', function (error, type) {
	module.exports.emit('error', error, type);
});
