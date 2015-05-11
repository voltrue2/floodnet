'use strict';

exports.pack = function (data) {
	if (typeof data === 'string') {
		return data;
	}
	// this could throw an error
	return JSON.stringify(data);
};

exports.unpack = function (packed) {
	// this could throw an error
	return JSON.parse(packed);
};
