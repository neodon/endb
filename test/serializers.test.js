'use strict';

import test from 'ava';
import Endb from '../src';

test('Custom Serializers', async t => {
	t.plan(2);
	const endb = new Endb({
		serialize: JSON.stringify,
		deserialize: JSON.parse
	});
	t.is(await endb.set('foo', 'bar'), true);
	t.is(await endb.get('foo'), 'bar');
});
