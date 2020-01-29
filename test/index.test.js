'use strict';

const test = require('ava');
const Endb = require('../src');

test.serial('Class', t => {
	console.log(typeof Endb);
	t.is(typeof Endb, 'function');
	t.throws(() => Endb()); // eslint-disable-line new-cap
	t.notThrows(() => new Endb());
});
