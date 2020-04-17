'use strict';

const mysql = require('mysql2/promise');
const Sql = require('./sql');

module.exports = class MySQL extends Sql {
	constructor(options = {}) {
		const options_ = {
			uri: 'mysql://localhost',
			...options
		};
		super({
			dialect: 'mysql',
			async connect() {
				if (options_.connectTimeout) {
					options_.uri += `?connectTimeout=${Number(options.connectTimeout)}`;
				}

				const connection = await mysql.createConnection(options_.uri);
				return async (sqlString) => {
					const [row] = await connection.execute(sqlString);
					return row;
				};
			},
			...options_
		});
	}
};
