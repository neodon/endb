'use strict';

const {safeRequire} = require('..');
const pg = safeRequire('pg');
const Sql = require('./sql');

module.exports = class PostgreSQL extends Sql {
	constructor(options = {}) {
		const {uri = 'postgresql://localhost:5432'} = options;
		super({
			dialect: 'postgres',
			async connect() {
				const pool = new pg.Pool({connectionString: uri});
				const query = async (sqlString) => {
					const {rows} = await pool.query(sqlString);
					return rows;
				};

				return Promise.resolve(query);
			},
			...options
		});
	}
};
