'use strict';

const test = require('ava');
const Endb = require('../../src');
const { endbTest, adapterTest } = require('../functions');
const {
  POSTGRES_HOST = 'localhost',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD,
  POSTGRES_DB = 'endb_test',
} = process.env;
const uri = `postgresql://${POSTGRES_USER}${POSTGRES_PASSWORD ? `:${POSTGRES_PASSWORD}` : ''}@${POSTGRES_HOST}:5432/${POSTGRES_DB}`;

adapterTest(test, Endb, uri);
endbTest(test, Endb, { uri });
