<div align="center">
    <p>
        <a href="https://endb.js.org"><img src="docs/media/logo.png" width="300" height="220" alt="endb" /></a>
    </p>
    <p>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/v/endb" alt="Version" /></a>
        <a href="https://travis-ci.org/chroventer/endb"><img src="https://travis-ci.org/chroventer/endb.svg?branch=master" alt="Build Status" /></a>
        <a href="https://david-dm.org/chroventer/endb"><img src="https://img.shields.io/david/chroventer/endb.svg?maxAge=3600" alt="NPM Dependencies" /></a>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/dt/endb" alt="NPM Downloads" /></a>
        <a href="https://github.com/chroventer/endb"><img src="https://badgen.net/github/stars/chroventer/endb" alt="GitHub Stars" /></a>
        <a href="https://github.com/chroventer/endb/blob/master/LICENSE"><img src="https://badgen.net/github/license/chroventer/endb" alt="License" /></a>
        <a href="https://discord.gg/cetqPMv"><img src="https://discordapp.com/api/guilds/632514027427332116/embed.png" alt="Discord" /></a>
    </p>
</div>

🗃 Simple key-value storage with support for multiple backends

New to Endb? Check out the [Documentation](https://endb.js.org).

- **Easy-to-use**: Simplistic and yet efficient; has a simple and easy-to-use promise-based API.
- [**Adapters**](#Usage): Officially supported adapters are LevelDB, MongoDB, MySQL, PostgreSQL, Redis, and SQLite.
- [**Third-Party Adapters**](#Third-Party-Adapters): You can optionally use third-party adapters or build your own. Endb will integrate the third-party adapter and handle complex types internally.
- [**Namespaces**](#Namespaces): Namespaces isolate elements within a database, separate elements (keys & values) by prefixing the keys, and allow you to clear only a certain namespace while using the same database.
- **Data Types**: Handles all the JSON types including `Buffer` using its own serialization methods.
- **Error-Handling**: Connection errors are sent through, from the adapter to the main instance (connection errors won't kill the process).

## Installation

```bash
npm install endb
```

By default, data is stored in memory. Optionally, You can install an adapter.

```bash
$ npm install level # LevelDB
$ npm install mongojs # MongoDB
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
await endb.find(v => v === 'bar'); // { ... }
await endb.delete('foo'); // true
await endb.clear(); // undefined
```

## Namespaces

- **Isolation**: Namespaces isolate elements within a database.
- **Avoid Key-Collisions**: Endb namespaces separate elements (keys & values) by prefixing the key with a certain name.
- **Clear Certain Namespace**: Namespaces allow you to clear only a certain namespace while using the same database.

```javascript
const users = new Endb({ namespace: 'users' });
const members = new Endb({ namespace: 'cache' });

await users.set('foo', 'users'); // true
await members.set('foo', 'members'); // true
await users.get('foo'); // 'users'
await members.get('foo'); // 'members'
await users.clear(); // undefined
await users.get('foo'); // undefined
await members.get('foo'); // 'members'
```

## Third-Party Adapters

Optionally, you can use third-party adapters or build your own. Endb will integrate the third-party adapter and handle complex types internally.

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

## Links

- [Documentation](https://endb.js.org "Documentation")
- [NPM](https://npmjs.com/package/endb "NPM")
- [GitHub](https://github.com/chroventer/endb "GitHub")
- [Discord](https://discord.gg/cetqPMv "Discord")
