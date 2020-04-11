'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');

adapterTest(test, Endb, 'mysql://mysql@localhost/endb_test', 'mysql://foo');
endbTest(test, Endb, { uri: 'mysql://mysql@localhost/endb_test' });