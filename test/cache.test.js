const test = require('ava');
const Endb = require('../src');

test.serial('Adapters (Cache)', async t => {
	const endb = new Endb({ store: new Map() });
	t.is(store.size, 0);
	t.is(await endb.set('foo', 'bar'), true);
	t.is(await endb.get('foo'), 'bar');
	t.is(store.size, 1);
});
