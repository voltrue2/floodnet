var flood = require('../');
var fs = require('./fs');

flood.setup({ debug: false, reconnect: false }, function (error) {

	if (error) {
		return console.error(error);
	}

	flood.subscribe('test', function (key, msg) {
		fs.write(fs.RIGHT, msg.id + ' ' + msg.data, function () {
			console.log('RRR data recieved:', key, JSON.stringify(msg));
		});
	});

	setInterval(function () {
		flood.publish('test', Date.now());
	}, 100);

});
