var fs = require('fs');
var path = process.cwd() + '/test/';
var LEFT = 'LEFT';
var RIGHT = 'RIGHT';
var MAX_LINE = 100;
var counter = {
	LEFT: 0,
	RIGHT: 0
};

exports.LEFT = LEFT;
exports.RIGHT = RIGHT;

exports.write = function (file, data, cb) {
	
	if (counter[file] === MAX_LINE) {
		return cb();
	}

	counter[file] += 1;

	fs.appendFile(path + file, counter[file] + ': ' + data + '\n', cb);
};

exports.read = function (file, cb) {
	fs.readFile(path + file, function (error, data) {
		if (error) {
			return cb(error);
		}
		var content = data.toString().split('\n');
		var list = [];
		for (var i = 0, len = content.length; i < len; i++) {
			list.push(content[i].replace((i + 1) + ': ', 0));
		}
		cb(null, list);
	});
};

// we ignore any errors...
exports.clean = function (cb) {
	fs.unlink(path + LEFT, function () {
		fs.unlink(path + RIGHT, function () {
			cb();
		});
	});
};
