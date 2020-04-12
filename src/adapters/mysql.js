'use strict';

const {safeRequire} = require('..');
const mysql = safeRequire('mysql2/promise');
const Sql = require('./sql');

module.exports = class MySQL extends Sql {
	constructor(options = {}) {
		options = Object.assign({uri: 'mysql://localhost'}, options);
		super({
			dialect: 'mysql',
			async connect() {
				const connection = await mysql.createConnection(options.uri);
				const query = async (sqlString) => {
					const [row] = await connection.execute(sqlString);
					return row;
				};

				return query;
			},
			...options
		});
	}
};
