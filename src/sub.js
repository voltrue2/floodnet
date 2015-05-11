'use strict';

var cluster = require('cluster');
var defaults = require('./lib/defaults');
var encoder = require('./lib/encoder');
var redis = require('redis');
var client;

exports.setup = function (cb) {

	if (cluster.isMaster) {

		client = redis.createClient(
			defaults.config.port,
			defaults.config.host,
			defaults.config.options
		);

		if (defaults.config.options && defaults.config.options.auth_pass) {
			var pass = defaults.config.options.auth_pass;
			return client.auth(pass, cb);
		}

		return cb();
	}

	return cb();
};

exports.exit = function (cb) {
	
	if (cluster.isMaster) {
		return client.quit(cb);
	}

	cb();
};

exports.subscribe = function (channel, cb) {
	// FIXME: don't want to subscribe if it's a master process...
	client.subscribe(defaults.config.prefix + channel);
	client.on('message', function (key, packed) {
		var unpacked = encoder.unpack(packed);
		
		if (unpacked.id === defaults.id) {
			// publish from myself > ignore it
			return;
		}

		cb(key, unpacked);
	});
};

exports.unsubscribe = function (channel) {
	client.unsubscribe(channel, 0);
};
