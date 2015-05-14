var flood = require('../');
var fs = require('./fs');

flood.on('end', function (type) {
	console.log('end', type);
});

flood.on('connect', function (type) {
	console.log('connect', type);
});

flood.on('error', function (error, type) {
	console.log('error', error, type);
});

flood.setup({ debug: false }, function (error) {

	if (error) {
		return console.error(error);
	}

	flood.subscribe('test', function (key, msg) {
		fs.write(fs.LEFT, msg.id + ' ' + msg.data, function () {
			console.log('LLL data recieved:', key, JSON.stringify(msg));
		});
	});

	setInterval(function () {
		flood.publish('test', Date.now());
	}, 50);

	setTimeout(function () {
		console.log('left is leaving...');
		flood.unsubscribe('test');		
	}, 4000);

	setTimeout(function () {
		console.log('quiting...');
		flood.exit(function () {
			console.log('quit');
		});
	}, 5000);

});
