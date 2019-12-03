<div align="center">
    <p>
        <a href="https://endb.js.org"><img src="docs/media/logo.png" width="300" height="220" alt="Endb" /></a>
    </p>
    <p>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/v/endb" alt="Version" /></a>
        <a href="https://travis-ci.org/chroventer/endb"><img src="https://travis-ci.org/chroventer/endb.svg?branch=master" alt="Build Status" /></a>
        <a href="https://david-dm.org/chroventer/endb"><img src="https://img.shields.io/david/chroventer/endb.svg?maxAge=3600" alt="NPM Dependencies" /></a>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/dt/endb" alt="NPM Downloads" /></a>
        <a href="https://github.com/chroventer/endb"><img src="https://badgen.net/github/stars/chroventer/endb" alt="GitHub Stars" /></a>
        <a href="https://github.com/chroventer/endb/blob/master/LICENSE"><img src="https://badgen.net/github/license/chroventer/endb" alt="License" /></a>
    </p>
</div>

🗃 Simple key-value storage with support for multiple backends.

New to Endb? Check out the [Documentation](https://endb.js.org).

- **Easy-to-use**: Simplistic and yet efficient. It also has a simple and easy-to-use promise-based API.
- [**Adapters**](#Usage): By default, data is stored in memory. You can optionally install (check out the Installation Guide) and utilize an adapter. Officially supported adapters are LevelDB, MongoDB, NeDB, MySQL, PostgreSQL, Redis, and SQLite.
- [**Third-Party Adapters**](#Third-Party-Adapters): You can optionally utilize third-party adapters or build your own. *Endb* will integrate the third-party adapter and handle complex data types internally.
- [**Namespaces**](#Namespaces): Namespaces isolate elements within a database, avoid key collisions, separate elements by prefixing the keys, and allow clearance of only one namespace while utilizing the same database.
- [**Custom Serializers**](#Custom-Serializers): Utilizes data serialization methods that encode Buffer data as a base64-encoded string, and decode JSON objects which contain buffer-like data (either as arrays of numbers or strings) into Buffer instances to ensure consistency across different backends.
Optionally, pass your own data serialization methods to support extra data types.
- **Data Types**: Handles all the JSON types including [`Buffer`](https://nodejs.org/api/buffer.html) using its data serialization methods.
- **Error-Handling**: Connection errors are sent through, from the adapter to the main instance; connection errors won't exit or kill the process.

## Installation

```bash
npm install endb
```

By default, data is stored in memory. You can optionally install and utilize an adapter. Officially supported adapters are LevelDB, MongoDB, NeDB, MySQL, PostgreSQL, Redis, and SQLite.

```bash
$ npm install level # LevelDB
$ npm install mongojs # MongoDB
$ npm install nedb # NeDB
$ npm install ioredis # Redis

# To use SQL database, an additional package 'sql' must be installed and an adapter
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

// Handles connection errors.
endb.on('error', err => console.log('Connection Error: ', err));

await endb.set('foo', 'bar'); // true
await endb.set('exists', true); // true
await endb.set('num', 10); // true
await endb.math('num', 'add', 40); // true
await endb.get('foo'); // 'bar'
await endb.get('exists'); // true
await endb.all(); // [ ... ]
await endb.has('foo'); // true
await endb.has('bar'); // false
await endb.find(v => v === 'bar'); // { ... }
await endb.delete('foo'); // true
await endb.clear(); // undefined
```

## Namespaces

Namespaces isolate elements within a database, avoid key collisions, separate elements by prefixing the keys, and allow clearance of only one namespace while utilizing the same database.

```javascript
const users = new Endb({ namespace: 'users' });
const members = new Endb({ namespace: 'members' });

await users.set('foo', 'users'); // true
await members.set('foo', 'members'); // true
await users.get('foo'); // 'users'
await members.get('foo'); // 'members'
await users.clear(); // undefined
await users.get('foo'); // undefined
await members.get('foo'); // 'members'
```

## Third-Party Adapters

You can optionally utilize third-party adapters or build your own. *Endb* will integrate the third-party adapter and handle complex data types internally.

```js
const myAdapter = require('./my-adapter');
const endb = new Endb({ store: myAdapter });
```

Any module that follows the [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) API will work.

```js
new Endb({ store: new Map() });
```

For example, [`quick-lru`](https://github.com/sindresorhus/quick-lru) is an unrelated module that implements the Map API.

```js
const Endb = require('endb');
const QuickLRU = require('quick-lru');
const lru = new QuickLRU({ maxSize: 1000 });
const endb = new Endb({ store: lru });
```

List of third-party adapters supported:
- [quick-lru](https://github.com/sindresorhus/quick-lru) - Simple "Least Recently Used" (LRU) cache
- [Add Your Own!](https://github.com/chroventer/endb/pulls)

## Custom Serializers

Utilizes data serialization methods that encode Buffer data as a base64-encoded string, and decode JSON objects which contain buffer-like data (either as arrays of numbers or strings) into Buffer instances to ensure consistency across different backends.
Optionally, pass your own data serialization methods to support extra data types.

```javascript
const endb = new Endb({
    serialize: JSON.stringify,
    deserialize: JSON.parse
});
```

## Links

- [Documentation](https://endb.js.org "Documentation")
- [NPM](https://npmjs.com/package/endb "NPM")
- [GitHub](https://github.com/chroventer/endb "GitHub")
