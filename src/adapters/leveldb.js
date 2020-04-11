'use strict';

const EventEmitter = require('events');
const {safeRequire} = require('..');
const Level = safeRequire('level');

module.exports = class LevelDB extends EventEmitter {
	constructor(options = {}) {
		super();
		const {uri = 'leveldb://db'} = options;
		this.db = new Level(uri.replace(/^leveldb:\/\//, ''), options, (error) => {
			if (error) this.emit('error', error);
		});
	}

	async all() {
		const stream = await this.db.createReadStream();
		stream.on('data', (data) => {
			return data;
		});
	}

	async clear() {
		const stream = await this.db.createKeyStream();
		stream.on('data', async (data) => {
			await this.db.del(data);
		});

		return undefined;
	}

	async close() {
		await this.db.close();
		return undefined;
	}

	async delete(key) {
		const data = this.db.del(key);
		return data > 0;
	}

	async get(key) {
		const data = await this.db.get(key);
		return data;
	}

	async has(key) {
		return this.db
			.get(key)
			.then((value) => {
				if (value) return true;
			})
			.catch((error) => {
				if (error) return false;
			});
	}

	async set(key, value) {
		return this.db.put(key, value);
	}
};
