'use strict';

const {EventEmitter} = require('events');
const util = require('../util');
const mongojs = util.safeRequire('mongojs');

module.exports = class MongoDB extends EventEmitter {
	constructor(url, options = {}) {
		super();
		url = url || {};
		if (typeof url === 'string') {
			url = {url};
		}

		if (url.uri) {
			url = Object.assign({url: url.uri}, url);
		}

		this.options = Object.assign(
			{
				url: 'mongodb://127.0.0.1:27017',
				collection: 'endb'
			},
			url,
			options
		);
		this.client = mongojs(this.options.uri);
		const collection = this.client.collection(this.options.collection);
		collection.createIndex(
			{key: 1},
			{
				unique: true,
				background: true
			}
		);
		this.db = ['update', 'find', 'findOne', 'remove'].reduce((obj, method) => {
			obj[method] = require('util').promisify(
				collection[method].bind(collection)
			);
			return obj;
		}, {});
		this.client.on('error', err => this.emit('error', err));
	}

	all() {
		return this.db.find().then(data => {
			const arr = [];
			for (const i in data) {
				arr.push({
					key: util.removeKeyPrefix(data[i].key, this.options.namespace),
					value: this.options.deserialize(data[i].value).value
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
		return this.db
			.findOne({key})
			.then(data => (data === null ? undefined : data.value));
	}

	set(key, value) {
		return this.db.update({key}, {$set: {key, value}}, {upsert: true});
	}
};
