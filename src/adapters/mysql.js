'use strict';

const {safeRequire} = require('../util');
const Sql = require('./Sql');
const mysql = safeRequire('mysql2/promise');

module.exports = class MySQL extends Sql {
	constructor(options = {}) {
		if (typeof options === 'string') {
			options = {uri: options};
		}

		options = Object.assign(
			{
				dialect: 'mysql',
				uri: 'mysql://localhost'
			},
			options
		);
		options.connect = () =>
			Promise.resolve()
				.then(() => mysql.createConnection(options.uri))
				.then(connection => {
					return sql => connection.execute(sql).then(data => data[0]);
				});
		super(options);
	}
};
