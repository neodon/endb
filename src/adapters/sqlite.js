'use strict';

const {safeRequire} = require('../util');
const Sql = require('./sql');
const sqlite3 = safeRequire('sqlite3');

module.exports = class SQLite extends Sql {
	constructor(options = {}) {
		options = Object.assign(
			{
				dialect: 'sqlite',
				uri: 'sqlite://:memory:'
			},
			options
		);
		options.path = options.uri.replace(/^sqlite:\/\//, '');
		options.connect = () =>
			new Promise((resolve, reject) => {
				const db = new sqlite3.Database(options.path, err => {
					if (err) {
						reject(err);
					} else {
						if (options.busyTimeout) {
							db.configure('busyTimeout', options.busyTimeout);
						}

						resolve(db);
					}
				});
			}).then(db =>
				require('util')
					.promisify(db.all)
					.bind(db)
			);
		super(options);
	}
};
