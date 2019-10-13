<div align="center">
    <br />
    <p>
        <a href="https://endb.js.org"><img src="media/logo.png" alt="endb" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/v/endb" alt="Version" /></a>
        <a href="https://travis-ci.org/chroventer/endb"><img src="https://travis-ci.org/chroventer/endb.svg?branch=master" alt="Build Status" /></a>
        <a href="https://david-dm.org/chroventer/endb"><img src="https://img.shields.io/david/chroventer/endb.svg?maxAge=3600" alt="Dependencies" /></a>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/dt/endb" alt="Downloads" /></a>
        <a href="https://github.com/chroventer/endb"><img src="https://badgen.net/github/stars/chroventer/endb" alt="Stars" /></a>
        <a href="https://github.com/chroventer/endb/blob/master/LICENSE"><img src="https://badgen.net/github/license/chroventer/endb" alt="License" /></a>
    </p>
</div>

Simple key-value storage for multi adapter.
Officially supported adapters are LevelDB, MongoDB, MySQL, PostgreSQL, Redis, and SQLite.
You can also integrate your own adapter (open a pull-request).

New to Endb? Check out the [API Reference](https://endb.js.org)

## Features

* High performance, efficiency, and simplicity.
* Simple [Promise-based API](#Usage).
* Suitable as cache or persistent database.
* Supports [adapters](#Usage), [namespaces](#Namespaces), [serializers](#Custom-Serializers).
* Handles all JSON types including `Buffer`.
* Connection errors are sent to instance (connection errors won't kill the process).

## Installation

```bash
npm install endb
```

By default, data is stored in memory. Optionally, You can install an adapter.

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

```javascript
const Endb = require('endb');

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
await endb.set('exists', true); // true
await endb.set('num', 10); // true
await endb.math('num', 'add', 40); // true
await endb.get('foo'); // 'bar'
await endb.get('exists'); // true
await endb.all(); // { ... }
await endb.has('foo'); // true
await endb.has('bar'); // false
await endb.find(value => value === 'bar'); // { ... }
await endb.delete('foo'); // true
await endb.clear(); // undefined
```

## Namespaces

You can set a namespace to avoid key collisions and namespaces allow you to clear only a certain namespace while using the same database.

```javascript
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

## Third-party Adapters

You can integrate and use a third-party adapter or build your own.

```js
const Endb = require('endb');
const myAdapter = require('./my-adapter');

const endb = new Endb({ store: myAdapter });
```

Any store that follows the [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) API will work.

```js
new Endb({ store: new Map() });
```

For example, [`quick-lru`](https://github.com/sindresorhus/quick-lru) is an unrelated module that implements the Map API.
However, extension methods (all and find) may not work.

```js
const Endb = require('endb');
const QuickLRU = require('quick-lru');

const endb = new Endb({ store: new QuickLRU() });
```

## Custom Serializers

Endb uses its own parse and stringify functions for serialization and deserialization of data to ensure consistency.
Optionally, You can pass your own (de)serialization functions to support extra data types or to (de)serialize to something else.

```javascript
const endb = new Endb({
    serialize: JSON.stringify,
    deserialize: JSON.parse
});
```
