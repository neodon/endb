'use strict';

const { safeRequire } = require('../util');
const { Database } = safeRequire('sqlite3');
const EndbSql = require('./sql');

class EndbSqlite extends EndbSql {
  constructor(options = {}) {
    options = Object.assign({
      dialect: 'sqlite',
      uri: 'sqlite://:memory:',
    }, options);
    options.path = options.uri.replace(/^sqlite:\/\//, '');
    options.connect = () => new Promise((resolve, reject) => {
      const db = new Database(options.path, err => {
        if (err) {
          reject(err);
        } else {
          if (options.busyTimeout) {
            db.configure('busyTimeout', options.busyTimeout);
          }
          resolve(db);
        }
      });
    }).then(db => require('util').promisify(db.all).bind(db));
    super(options);
  }
}

module.exports = EndbSqlite;
