'use strict';

var cluster = require('cluster');
var defaults = require('./lib/defaults');
var encoder = require('./lib/encoder');
var redis = require('redis');
var client;

exports.setup = function (cb) {

	process.on('message', handleMsgFromWorker);

	connect();

	client.on('end', function () {
		defaults.event.emit('end', 'pub');
		defaults.log('publisher connection closed');
	});

	client.on('error', function (error) {
		defaults.event.emit('error', error, 'pub');	

		defaults.log('publisher connection failed');

		if (defaults.config.reconnect && error.message === defaults.ECONNREFUSED) {

			defaults.log('auto-reconnecting');

			connect();
		}
	});

	client.on('connect', function () {
		defaults.event.emit('connect', 'pub');		

		if (defaults.config.options && defaults.config.options.auth_pass) {
			return client.auth(defaults.config.options.auth_pass, cb);
		}

		cb();
	});
};

exports.exit = function (cb) {

	defaults.log('publisher closing connection');

	client.quit(cb);
};

exports.publish = function (channel, data) {
	
	if (cluster.isMaster) {
		// master process in cluster mode or none-cluster mode
		var sendData = {
			id: defaults.id,
			data: data
		};
		return client.publish(defaults.config.prefix + channel, encoder.pack(sendData));
	}

	// a worker process of a cluster: send a message to master process to publish
	var msg = {
		prefix: defaults.config.prefix,
		channel: channel,
		data: data
	};
	process.send(encoder.pack(msg));
};

function connect() {
	client = redis.createClient(
		defaults.config.port,
		defaults.config.host,
		defaults.config.options
	);
}

function handleMsgFromWorker(packed) {

	if (cluster.isMaster) {
		var msg = encoder.unpack(packed);
		
		if (msg.prefix !== defaults.config.prefix) {
			// message is not for floodnet
			return;
		}

		exports.publish(msg.channel, msg.data);
	}
}
