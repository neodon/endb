'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');
const { MONGO_HOST = '127.0.0.1' } = process.env;
const uri = `mongodb://${MONGO_HOST}:27017`;

adapterTest(
  test,
  Endb,
  uri,
  'mongodb://127.0.0.1:1234'
);
endbTest(test, Endb, { uri: 'mongodb://127.0.0.1:2701' });
