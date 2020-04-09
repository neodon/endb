'use strict';

const {safeRequire} = require('..');
const mysql = safeRequire('mysql2/promise');
const Sql = require('./Sql');

module.exports = class MySQL extends Sql {
	constructor(options = {}) {
		const {uri = 'mysql://localhost'} = options;
		super({
			dialect: 'mysql',
			async connect() {
				const connection = await mysql.createConnection(uri);
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
