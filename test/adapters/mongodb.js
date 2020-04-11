'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');

adapterTest(test, Endb, 'mongodb://127.0.0.1:27017', 'mongodb://127.0.0.1:1234');
endbTest(test, Endb, { uri: 'mongodb://127.0.0.1:2701' });