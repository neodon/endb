'use strict';

import { serial } from 'ava';
import Endb from '../src/index';

serial('Class', t => {
  console.log(typeof Endb)
  t.is(typeof Endb, 'function');
  t.throws(() => Endb());
  t.notThrows(() => new Endb());
});