'use strict';

const {EventEmitter} = require('events');
const {safeRequire} = require('../util');
const Level = safeRequire('level');

module.exports = class LevelDB extends EventEmitter {
	constructor(uri, options = {}) {
		super();
		options = Object.assign(
			{
				uri: 'leveldb://:memory:'
			},
			typeof uri === 'string' ? {uri} : uri,
			options
		);
		const client = new Level(
			options.uri.replace(/^leveldb:\/\//, ''),
			options,
			err => {
				this.emit('error', err);
			}
		);
		this.db = [
			'del',
			'createKeyStream',
			'createReadStream',
			'get',
			'put',
			'close'
		].reduce((obj, method) => {
			obj[method] = require('util').promisify(client[method].bind(client));
			return obj;
		}, {});
	}

	all() {
		return this.db.createReadStream().then(stream => {
			stream.on('data', data => {
				return data;
			});
		});
	}

	clear() {
		return this.db.createKeyStream().then(stream => {
			stream.on('data', async data => {
				await this.db.del(data);
			});
			return undefined;
		});
	}

	close() {
		return this.db.close().then(() => undefined);
	}

	delete(key) {
		return this.db.del(key).then(data => data > 0);
	}

	get(key) {
		return this.db.get(key).then(data => {
			if (data === null) return undefined;
			return data;
		});
	}

	set(key, value) {
		return this.db.put(key, value);
	}
};
