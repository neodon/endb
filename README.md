<div align="center">
    <p>
        <a href="https://endb.js.org"><img src="docs/media/logo.png" alt="endb" /></a>
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

🗃 Simple key-value storage for multi adapter.
New to Endb? Check out the [Documentation](https://endb.js.org).

- **Easy-to-use**: Endb is simplistic and efficient. It also has a simple promise-based API.
- [**Adapters**](#Usage): Officially supported adapters are LevelDB, MongoDB, MySQL, PostgreSQL, Redis, and SQLite. You can also [integrate your own adapter](https://github.com/chroventer/endb/pulls)
- [**Namespaces**](https://endb.js.org/tutorial-Namespaces.html): Namespaces isolate elements within a database, separate elements (keys & values) by prefixing the keys, and allow you to clear only a certain namespace while using the same database.
- [**Custom Serializers**](https://endb.js.org/tutorial-Custom-Serializers.html): Endb uses its own parse and stringify methods for data serialization to ensure consistency. Optionally, You can pass your own serialization methods to support extra data types.
- [**Third-Party Adapters**](https://endb.js.org/tutorial-Third-Party-Adapters.html): Integrate and use third-party adapters or build your own.
- **Data Types**: Endb handles all the JSON types including `Buffer`.
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
