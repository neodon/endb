'use strict';

const {EventEmitter} = require('events');
const {Util} = require('../util');
const Nedb = Util.safeRequire('nedb');

module.exports = class NeDB extends EventEmitter {
	constructor(options = {}) {
		super();
		this.options = Util.mergeDefault(
			{
				uri: 'nedb://endb'
			},
			options
		);
		this.options.filename = this.options.uri.replace(/^nedb:\/\//, '');
		const client = new Nedb(this.options);
		this.db = ['update', 'find', 'findOne', 'remove'].reduce((obj, method) => {
			obj[method] = require('util').promisify(client[method].bind(client));
			return obj;
		}, {});
		client.on('error', error => this.emit('error', error));
	}

	all() {
		return this.db.find().then(data => {
			const arr = [];
			for (const i in data) {
				arr.push({
					key: Util.removeKeyPrefix(data[i].key, this.options.namespace),
					value: this.options.deserialize(data[i].value)
				});
			}

			return arr;
		});
	}

	clear() {
		return this.db
			.remove({key: new RegExp(`^${this.options.namespace}:`)})
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
