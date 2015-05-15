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
			defaults.event.emit('end', 'sub');
			defaults.log('subscriber connection closed');
		});

		client.on('error', function (error) {
			defaults.event.emit('error', error, 'sub');

			defaults.log('subscriber connection failed');

			if (defaults.config.reconnect && error.message === defaults.ECONNREFUSED) {
				connect();
			}
		});

		client.on('connect', function () {
			defaults.event.emit('connect', 'sub');

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

		if (unpacked.data === defaults.HELLO) {
			defaults.event.emit(defaults.HELLO, channel, unpacked);
		}

		if (unpacked.data === defaults.BYE) {
			defaults.event.emit(defaults.BYE, channel, unpacked);
		}

		if (unpacked.data === defaults.HEARTBEAT) {
			defaults.event.emit(defaults.HEARTBEAT, channel, unpacked);
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
