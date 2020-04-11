'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');
const { REDIS_HOST = 'localhost' } = process.env;
const uri = `redis://${REDIS_HOST}`;

adapterTest(test, Endb, uri, 'redis://foo');
endbTest(test, Endb, { uri });
