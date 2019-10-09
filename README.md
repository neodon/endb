<div align="center">
    <a href="https://endb.js.org"><img src="media/logo.png" alt="endb"/></a>
</div>
<br/>
<br/>

[![NPM Version](https://badgen.net/npm/v/endb)](https://www.npmjs.com/package/endb)
[![Build Status](https://travis-ci.org/chroventer/endb.svg?branch=master)](https://travis-ci.org/chroventer/endb)
[![NPM Dependencies](https://img.shields.io/david/chroventer/endb.svg?maxAge=3600)](https://david-dm.org/chroventer/endb)
[![NPM Downloads](https://badgen.net/npm/dt/endb)](https://www.npmjs.com/package/endb)
[![GitHub Stars](https://badgen.net/github/stars/chroventer/endb)](https://github.com/chroventer/endb)
[![License](https://badgen.net/github/license/chroventer/endb)](https://github.com/chroventer/endb/blob/master/LICENSE)

Simple key-value database with cache and multi adapter support.
Supported adapters are LevelDB, MongoDB, MySQL, PostgreSQL, Redis, and SQLite.

New to Endb? Check out the [API Reference](https://endb.js.org)

## Features

* High performance, efficiency, and simplicity
* Simple [Promise-based API](#Usage)
* Suitable as cache or persistent database
* Supports [adapters](#Usage), [namespaces](#Namespaces), [serializers](#Custom-Serializers)
* Handles all JSON types including Buffer
* Connection errors are sent (connection errors won't kill the process)

## Installation

```bash
npm install endb
```

By default, data is stored in memory. You can optionally install an adapter.

```bash
$ npm install level # LevelDB
$ npm install mongojs # MongoDB
$ npm install redis

# To use SQL database, install an additional 'sql' package and the adapter
$ npm install sql

$ npm install mysql2 # MySQL
$ npm install pg # PostgreSQL
$ npm install sqlite3 # SQLite
```

## Usage

```js
const Endb = require('endb');

// Supported Adapters
const endb = new Endb();
const endb = new Endb('leveldb://path/to/database');
const endb = new Endb('mongodb://user:pass@localhost:27017/dbname');
const endb = new Endb('mysql://user:pass@localhost:3306/dbname');
const endb = new Endb('postgresql://user:pass@localhost:5432/dbname');
const endb = new Endb('redis://user:pass@localhost:6379');
const endb = new Endb('sqlite://path/to/database.sqlite');

// Handles database connection error
endb.on('error', err => console.log('Connection Error: ', err));

await endb.set('foo', 'bar'); // true
await endb.set('num', 10); // true
await endb.math('num', 'add', 40); // true
await endb.get('foo'); // 'bar'
await endb.all();
await endb.has('foo'); // true
await endb.has('bar'); // false
await endb.delete('foo'); // true
await endb.clear(); // undefined
```

## Namespaces

You can set a namespace to avoid key collisions and namespaces allow you to clear only a certain namespace while using the same database.

```js
const users = new Endb('redis://user:pass@localhost:6379', { namespace: 'users' });
const cache = new Endb('redis://user:pass@localhost:6379', { namespace: 'cache' });

await users.set('foo', 'users'); // true
await cache.set('foo', 'cache'); // true
await users.get('foo'); // 'users'
await cache.get('foo'); // 'cache'
await users.clear(); // undefined
await users.get('foo'); // undefined
await cache.get('foo'); // 'cache'
```

## Custom Serializers

It uses JSON buffer for serialization and deserialization of data to ensure consistency.
You can optionally pass your own (de)serialization functions to support extra data types or to (de)serialize to something other than JSON.

```js
const endb = new Endb({
    serialize: JSON.stringify,
    deserialize: JSON.parse
});
```
