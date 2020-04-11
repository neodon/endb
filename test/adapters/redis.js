'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');

adapterTest(test, Endb, 'redis://localhost', 'redis://foo');
endbTest(test, Endb, { uri: 'redis://localhost' });