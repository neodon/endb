'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');

adapterTest(test, Endb, 'postgresql://postgres@localhost:5432/endb_test', 'postgresql://foo');
endbTest(test, Endb, { uri: 'postgresql://postgres@localhost:5432/endb_test' });