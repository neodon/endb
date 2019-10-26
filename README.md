<div align="center">
    <p>
        <a href="https://endb.js.org"><img src="docs/media/logo.png" alt="endb" /></a>
    </p>
    <p>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/v/endb" alt="Version" /></a>
        <a href="https://travis-ci.org/chroventer/endb"><img src="https://travis-ci.org/chroventer/endb.svg?branch=master" alt="Build Status" /></a>
        <a href="https://david-dm.org/chroventer/endb"><img src="https://img.shields.io/david/chroventer/endb.svg?maxAge=3600" alt="Dependencies" /></a>
        <a href="https://www.npmjs.com/package/endb"><img src="https://badgen.net/npm/dt/endb" alt="Downloads" /></a>
        <a href="https://github.com/chroventer/endb"><img src="https://badgen.net/github/stars/chroventer/endb" alt="Stars" /></a>
        <a href="https://github.com/chroventer/endb/blob/master/LICENSE"><img src="https://badgen.net/github/license/chroventer/endb" alt="License" /></a>
    </p>
</div>

🗃 Simple key-value storage for multi adapter.

Officially supported adapters are LevelDB, MongoDB, MySQL, PostgreSQL, Redis, and SQLite.
You can also [integrate your own adapter](https://github.com/chroventer/endb/pulls).

New to Endb? Check out the [Documentation](https://endb.js.org).

## Why Endb?

- High performance, efficiency, and simplicity.
- [Promise-based API](#Usage).
- Suitable as cache or persistent database.
- [Adapters](#Usage)
- [Namespaces](https://endb.js.org/tutorial-Namespaces.html)
- [Custom Serializers](https://endb.js.org/tutorial-Custom-Serializers.html)
- [Third-Party Adapters](https://endb.js.org/tutorial-Third-Party-Adapters.html)
- JSON types including `Buffer`
- Connection errors are sent through (connection errors won't kill the process).

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
await endb.find(v => v === 'bar'); // { ... }
await endb.delete('foo'); // true
await endb.clear(); // undefined
```

## Links

- [Documentation](https://endb.js.org)
- [NPM](https://npmjs.com/package/endb)
- [Discord](https://discord.gg/cetqPMv)
