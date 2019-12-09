'use strict';

const {EventEmitter} = require('events');
const {removeKeyPrefix, safeRequire} = require('../util');
const Nedb = safeRequire('nedb');

module.exports = class NeDB extends EventEmitter {
	constructor(uri, options = {}) {
		super();
		options = Object.assign(
			{
				uri: 'nedb://endb'
			},
			typeof uri === 'string' ? {uri} : uri,
			options
		);
		options.filename = options.uri.replace(/^nedb:\/\//, '');
		const client = new Nedb(options);
		this.db = ['update', 'find', 'findOne', 'remove'].reduce((obj, method) => {
			obj[method] = require('util').promisify(client[method].bind(client));
			return obj;
		}, {});
		client.on('error', err => this.emit('error', err));
	}

	all() {
		return this.db.find().then(data => {
			const arr = [];
			for (const i in data) {
				arr.push({
					key: removeKeyPrefix(data[i].key, this.options.namespace),
					value: this.options.deserialize(data[i].value)
				});
			}

			return arr;
		});
	}

	clear() {
		return this.db
			.remove({key: new RegExp(`^${this.namespace}:`)})
			.then(() => undefined);
	}

	close() {
		return this.client.close();
	}

	delete(key) {
		return this.db.remove({key}).then(data => data.n > 0);
	}

	get(key) {
		return this.db.findOne({key}).then(data => {
			if (data === null) return undefined;
			return data.value;
		});
	}

	set(key, value) {
		return this.db.update({key}, {$set: {key, value}}, {upsert: true});
	}
};
