'use strict';

var cluster = require('cluster');
var defaults = require('./lib/defaults');
var encoder = require('./lib/encoder');
var redis = require('redis');
var client;

exports.setup = function (cb) {

	if (cluster.isMaster) {

		client = connect();
		
		client.on('end', function () {
			defaults.event.emit('end');
			defaults.log('connection closed');
		});

		client.on('error', function (error) {
			defaults.event.emit('error', error);

			defaults.log('connection failed');

			if (defaults.config.reconnect && error.message === defaults.ECONNREFUSED) {
				connect();
			}
		});

		client.on('connect', function () {
			defaults.event.emit('connect');

			if (defaults.config.options && defaults.config.options.auth_pass) {
				var pass = defaults.config.options.auth_pass;
				return client.auth(pass, cb);
			}

			cb();
		});

		return;
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

function connect() {
	return redis.createClient(
		defaults.config.port,
		defaults.config.host,
		defaults.config.options
	);
}
