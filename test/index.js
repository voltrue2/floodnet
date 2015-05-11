var assert = require('assert');
var exec = require('child_process').exec;
var testFs = require('./fs');
var start = process.cwd() + '/daemon start ' + process.cwd();
var stop = process.cwd() + '/daemon stop ' + process.cwd();
var status = process.cwd() + '/daemon status ' + process.cwd();
var left = '/test/left.js';
var right = '/test/right.js';

describe('Tests mesh networking', function () {

	it('Cleans up left process before tests', function (done) {
		exec(status + left, function (err, out) {
			if (out) {
				return exec(stop + left, done);
			}
			done();
		});
	});
	
	it('Cleans up right process before tests', function (done) {
		exec(status + right, function (err, out) {
			if (out) {
				return exec(stop + right, done);
			}
			done();
		});
	});

	it('Can clean up the log files before test', function (done) {
		testFs.clean(done);
	});

	it('Can start left process for test', function (done) {
		exec(start + left, done);
	});

	it('Can varify left process status', function (done) {
		exec(status + left, function (err, out) {
			assert.equal(err, null);
			assert(out);
			done();
		});
	});
	
	it('Can start right process for test', function (done) {
		exec(start + right, done);
	});

	it('Can varify right process status', function (done) {
		exec(status + right, function (err, out) {
			assert.equal(err, null);
			assert(out);
			done();
		});
	});

	it('Can read log file of left', function (done) {
		testFs.read(testFs.LEFT, function (error, data) {
			console.log(error, data);
			done();
		});
	});

});
