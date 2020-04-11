'use strict';

const EventEmitter = require('events');
const {safeRequire} = require('..');
const Ioredis = safeRequire('ioredis');

module.exports = class Redis extends EventEmitter {
	constructor(options = {}) {
		super();
		const {uri} = options;
		this.db = new Ioredis(uri, options);
		this.db.on('error', (error) => this.emit('error', error));
	}

	async all() {
		const data = await this.db.keys();
		return data;
	}

	clear() {
		return this.db
			.smembers(this._prefixNamespace())
			.then((data) => this.db.del(data.concat(this._prefixNamespace())))
			.then(() => undefined);
	}

	close() {
		return this.db.disconnect().then(() => undefined);
	}

	delete(key) {
		return this.db.del(key).then((data) => {
			return this.db.srem(this._prefixNamespace(), key).then(() => data > 0);
		});
	}

	get(key) {
		return this.db.get(key).then((data) => {
			if (data === null) return undefined;
			return data;
		});
	}

	set(key, value) {
		return Promise.resolve()
			.then(() => {
				return this.db.set(key, value);
			})
			.then(() => this.db.sadd(this._prefixNamespace(), key));
	}

	_prefixNamespace() {
		return `namespace:${this.namespace}`;
	}
};
