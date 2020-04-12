'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');

adapterTest(
  test,
  Endb,
  'sqlite://test.sqlite'
);
endbTest(test, Endb, { uri: 'sqlite://test.sqlite', busyTimeout: 30000 });
