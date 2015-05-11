'use strict';

var redis = require('redis');
var defaults = require('./src/lib/defaults');
var pub = require('./src/pub');
var sub = require('./src/sub');

var HELLO = 'hello';
var BYE = 'bye';

exports.setup = function (config, cb) {
	
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

	log('setting up [ID: ' + defaults.id + ']');

	pub.setup(function (error) {
		if (error) {
			log(error);
			return cb(error);
		}

		log('publisher setup [done]');

		sub.setup(function (error2) {
			if (error2) {
				log(error2);
				return cb(error2);
			}

			log('subscriber setup [done]');
			
			cb();
		});
	});	
};

exports.subscribe = function (channel, cb) {
	// subscribe to a channel
	sub.subscribe(channel, cb);
	// announce its subscription to the others in the channel
	exports.publish(channel, HELLO);
};

exports.unsubscribe = function (channel) {
	// unsubscribe from a channel
	sub.unsubscribe(channel);
	// announce its unsubscription to the others in the channel
	exports.publish(channel, BYE);
};

exports.publish = function (channel, data) {
	pub.publish(channel, data);
};

exports.exit = function (cb) {
	pub.exit(function () {
		sub.exit(cb);
	});
};

function log() {
	
	if (!defaults.config.debug) {
		return;
	}
	
	for (var i in arguments) {
		var arg = '[floodnet] ' + arguments[i];
		console.log(arg);
	}
}
