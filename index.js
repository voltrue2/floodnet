'use strict';

var EventEmitter = require('events').EventEmitter;
var redis = require('redis');
var defaults = require('./src/lib/defaults');
var pub = require('./src/pub');
var sub = require('./src/sub');

// a map of online mesh nodes
// this is maintained by heartbeat
var nodes = {};
var online = false;

module.exports = new EventEmitter();

module.exports.setup = function (config, cb) {
	
	if (config) {
		for (var key in config) {
			defaults.config[key] = config[key];
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
	// add a new channel
	if (!nodes[channel]) {
		nodes[channel] = {};
	}
	// subscribe to a channel
	sub.subscribe(channel, cb);
	// announce its subscription to the others in the channel
	module.exports.publish(channel, defaults.HELLO);
};

module.exports.unsubscribe = function (channel) {
	// unsubscribe from a channel
	sub.unsubscribe(channel);
	// announce its unsubscription to the others in the channel
	module.exports.publish(channel, defaults.BYE);
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
	online = false;
	module.exports.emit('end', type);
});

defaults.event.on('connect', function (type) {
	online = true;
	startHeartbeat();
	module.exports.emit('connect', type);
});

defaults.event.on('error', function (error, type) {
	module.exports.emit('error', error, type);
});

defaults.event.on(defaults.BYE, function (channel, msg) {
	if (nodes[channel] && nodes[channel][msg.id]) {
		defaults.log('mesh node has gone offline: ' + msg.id);
		delete nodes[channel][msg.id];
		module.exports.emit('nodeRemoved', msg.id);
	}
});

defaults.event.on(defaults.HELLO, handleHello);

defaults.event.on('heartbeat', handleHello);

function handleHello(channel, msg) {
	var now = Date.now();	

	if (!nodes[channel]) {
		nodes[channel] = {};
	}

	if (!nodes[channel][msg.id]) {
		defaults.log('new mesh node online: ' + msg.id);
		nodes[channel][msg.id] = now;
		module.exports.emit('nodeAdded', msg.id);
	}

	nodes[channel][msg.id] = now;
}

function checkNodeStats(channel) {
	if (nodes[channel]) {
		var now = Date.now();
		var exp = defaults.config.heartbeatInterval * 2;
		for (var id in nodes[channel]) {
			var nodeLastSeen = nodes[channel][id];
			if (now - nodeLastSeen >= exp) {
				defaults.log('mesh node has timed out and considered off line: ' + id);
				delete nodes[channel][id];
				module.exports.emit('nodeRemoved', id);
			}
		}
	}
}

function startHeartbeat() {

	if (!defaults.config.hearbeatInterval) {
		return;
	}

	var heartbeat = function () {

		if (!online) {
			return;
		}

		for (var channel in nodes) {
			checkNodeStats(channel);
			pub.publish(channel, defaults.HEARTBEAT);
			defaults.log('send heartbeat: ' + channel);
		}
		setTimeout(heartbeat, defaults.config.heartbeatInterval);
	};

	defaults.log('start heartbeat at: ' + defaults.config.heartbeatInterval + 'ms');

	heartbeat();
}
