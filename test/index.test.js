'use strict';

const {serial} = require('ava');
const Endb = require('../src');

serial('Class', t => {
	console.log(typeof Endb);
	t.is(typeof Endb, 'function');
	t.throws(() => Endb()); // eslint-disable-line new-cap
	t.notThrows(() => new Endb());
});
