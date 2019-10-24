'use strict';

import test from 'ava';
import Endb from '../src';

test('Class', t => {
	console.log(typeof Endb);
	t.is(typeof Endb, 'function');
	t.throws(() => Endb());
	t.notThrows(() => new Endb());
});
