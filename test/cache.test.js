'use strict';

import { serial } from 'ava';
import Endb from '../src/index';

serial('Adapters (Cache)', async t => {
  const store = new Map();
  const endb = new Endb({ store });
  t.is(store.size, 0);
  t.is(await endb.set('foo', 'bar'), true);
  t.is(await endb.set('key', 'value'), true);
  t.is(await endb.has('foo'), true);
  t.is(await endb.has('endb'), false);
  t.is(await endb.get('foo'), 'bar');
  t.is(await endb.get('key'), 'value');
  t.is(await endb.delete('key'), true);
  t.deepEqual(await endb.all(), [ { key: 'foo', value: 'bar' } ]);
  t.deepEqual(await endb.find(element => element.value === 'bar'), { key: 'foo', value: 'bar' });
  t.is(store.size, 1);
  t.is(await endb.clear(), undefined);
});
