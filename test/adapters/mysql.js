'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');
const {
  MYSQL_HOST = 'localhost',
  MYSQL_USER = 'mysql',
  MYSQL_PASSWORD,
  MYSQL_DATABASE = 'endb_test',
} = process.env;
const uri = `mysql://${MYSQL_USER}${
  MYSQL_PASSWORD ? `:${MYSQL_PASSWORD}` : ''
}@${MYSQL_HOST}/${MYSQL_DATABASE}`;

adapterTest(test, Endb, uri, 'mysql://foo');
endbTest(test, Endb, { uri });
