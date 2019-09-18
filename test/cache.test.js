'use strict';

import { serial } from 'ava';
import Endb from '../src/index';

serial('Adapters (Cache)', async t => {
  const store = new Map();
  const endb = new Endb({ store });
  t.is(store.size, 0);
  t.is(await endb.set('foo', 'bar'), true);
  t.is(await endb.has('foo'), true);
  t.is(await endb.get('foo'), 'bar');
  t.deepEqual(await endb.all(), { 'endb:foo': 'bar' });
  t.is(store.size, 1);
});
