'use strict';

const {EventEmitter} = require('events');
const {safeRequire} = require('../util');
const Ioredis = safeRequire('ioredis');

module.exports = class Redis extends EventEmitter {
	constructor(uri, options = {}) {
		super();
		options = Object.assign({}, typeof uri === 'string' ? {uri} : uri, options);
		if (options.uri && typeof options.url === 'undefined') {
			options.url = options.uri;
		}

		const client = new Ioredis(options.uri, options);
		this.db = [
			'get',
			'keys',
			'set',
			'sadd',
			'del',
			'srem',
			'smembers',
			'end'
		].reduce((obj, method) => {
			obj[method] = require('util').promisify(client[method].bind(client));
			return obj;
		}, {});
		client.on('error', err => this.emit('error', err));
	}

	all() {
		return this.db.keys('*').then(data => {
			for (const element of data) {
				if (element === null) return undefined;
				return element;
			}
		});
	}

	clear() {
		return this.db
			.smembers(this._prefixNamespace())
			.then(data => this.db.del(data.concat(this._prefixNamespace())))
			.then(() => undefined);
	}

	close() {
		return this.db.end().then(() => undefined);
	}

	delete(key) {
		return this.db.del(key).then(data => {
			return this.db.srem(this._prefixNamespace(), key).then(() => data > 0);
		});
	}

	get(key) {
		return this.db.get(key).then(data => {
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
