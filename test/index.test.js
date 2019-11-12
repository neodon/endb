'use strict';

import {serial} from 'ava';
import {Endb} from '../src';

serial('Class', t => {
	console.log(typeof Endb);
	t.is(typeof Endb, 'function');
	t.throws(() => Endb()); // eslint-disable-line new-cap
	t.notThrows(() => new Endb());
});
