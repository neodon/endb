'use strict';

const {Util} = require('../util');
const sqlite3 = Util.safeRequire('sqlite3');
const Sql = require('./sql');

module.exports = class SQLite extends Sql {
	constructor(options = {}) {
		options = Util.mergeDefault(
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
