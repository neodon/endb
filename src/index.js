'use strict';

const {EventEmitter} = require('events');
const {
	addKeyPrefix,
	load,
	math: _math,
	parse,
	removeKeyPrefix,
	stringify
} = require('./util');

/**
 * @class Endb
 * @classdesc Simple key-value database with cache and multi adapter support.
 * @extends EventEmitter
 */
class Endb extends EventEmitter {
	/**
	 * @constructor
	 * @param {string} [uri=undefined] The connection string URI.
	 * @param {Object} [options={}] The options for the database.
	 * @param {string} [options.namespace='endb'] The name of the database.
	 * @param {Function} [options.serialize] A custom serialization function.
	 * @param {Function} [options.deserialize] A custom deserialization function.
	 * @param {string} [options.adapter] The adapter to be used.
	 * @param {string} [options.collection='endb'] The name of the collection. (only for MongoDB)
	 * @param {string} [options.table='endb'] The name of the table. (only for SQL adapters)
	 * @param {number} [options.keySize=255] The size of the key. (only for SQL adapters)
	 * @example
	 * const endb = new Endb();
	 * const endb = new Endb({
	 *     namespace: 'endb',
	 *     serialize: JSON.stringify,
	 *     deserialize: JSON.parse
	 * });
	 * const endb = new Endb('leveldb://path/to/database');
	 * const endb = new Endb('mongodb://user:pass@localhost:27017/dbname');
	 * const endb = new Endb('mysql://user:pass@localhost:3306/dbname');
	 * const endb = new Endb('postgresql://user:pass@localhost:5432/dbname');
	 * const endb = new Endb('redis://user:pass@localhost:6379');
	 * const endb = new Endb('sqlite://path/to/database.sqlite');
	 *
	 * // Handles database connection error
	 * endb.on('error', err => console.log('Connection Error: ', err));
	 *
	 * await endb.set('foo', 'bar'); // true
	 * await endb.set('exists', true); // true
	 * await endb.set('num', 10); // true
	 * await endb.math('num', 'add', 40); // true
	 * await endb.get('foo'); // 'bar'
	 * await endb.get('exists'); // true
	 * await endb.all(); // { ... }
	 * await endb.has('foo'); // true
	 * await endb.has('bar'); // false
	 * await endb.find(v => v === 'bar'); // { key: 'foo', value: 'bar' }
	 * await endb.delete('foo'); // true
	 * await endb.clear(); // undefined
	 */
	constructor(uri, options = {}) {
		super();
		this.options = Object.assign(
			{
				namespace: 'endb',
				serialize: stringify,
				deserialize: parse
			},
			typeof uri === 'string' ? {uri} : uri,
			options
		);

		if (!this.options.store) {
			this.options.store = load(Object.assign({}, this.options));
		}

		if (typeof this.options.store.on === 'function') {
			this.options.store.on('error', err => this.emit('error', err));
		}

		this.options.store.namespace = this.options.namespace;
	}

	/**
	 * Gets all the elements from the database.
	 * @returns {Promise<Array<any>>} All the elements from the database.
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar');
	 * await endb.set('en', 'db');
	 *
	 * await endb.all(); // [ { key: 'foo', value: 'bar' }, { key: 'en', value: 'db' } ]
	 */
	all() {
		return Promise.resolve()
			.then(() => {
				if (this.options.store instanceof Map) {
					const arr = [];
					for (const [key, value] of this.options.store) {
						arr.push({
							key: removeKeyPrefix(key, this.options.namespace),
							value: this.options.deserialize(value)
						});
					}

					return arr;
				}

				return this.options.store.all();
			})
			.then(data => {
				if (data === undefined) return undefined;
				return data;
			});
	}

	/**
	 * Removes all elements from the database.
	 * @returns {Promise<undefined>} Returns undefined
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo','bar');
	 * await endb.set('key', 'val');
	 *
	 * await endb.clear(); // true
	 *
	 * await endb.has('foo');
	 */
	clear() {
		return Promise.resolve().then(() => this.options.store.clear());
	}

	/**
	 * Removes the specified element from the database by key.
	 * @param {string} key The key of the element to remove from the database.
	 * @returns {Promise<boolean>} `true` if an element in the database existed and has been removed, or `false` if the element does not exist.
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar');
	 *
	 * await endb.delete('foo'); // true
	 */
	delete(key) {
		key = addKeyPrefix(key, this.options.namespace);
		return Promise.resolve().then(() => this.options.store.delete(key));
	}

	/**
	 * Finds or searches for a single item where the given function returns a truthy value.
	 * Behaves like {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find Array.prototype.find}.
	 * The database elements is mapped by their `key`. If you want to find an element by key, you should use the `get` method instead.
	 * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get MDN} for more details.
	 * @param {Function} fn The function to execute on each value in the element.
	 * @param {*} [thisArg] Object to use as `this` inside callback.
	 * @returns {Promise<Object<*>|undefined>} The first element in the database that satisfies the provided testing function. Otherwise `undefined` is returned
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar');
	 * await endb.set('profile', {
	 *   id: 1234567890,
	 *   username: 'user',
	 *   verified: true,
	 *   nil: null,
	 *   hobbies: ['programming']
	 * });
	 *
	 * await endb.find(v => v === 'bar'); // { key: 'foo', value: 'bar' }
	 * await endb.find(v => v.verified === true); // { key: 'profile', value: { ... } }
	 * await endb.find(v => v.desc === 'desc'); // undefined
	 */
	async find(fn, thisArg) {
		if (typeof thisArg !== undefined) {
			fn = fn.bind(thisArg);
		}

		const elements = await this.all();
		for (const element of elements) {
			if (fn(element.value, element.key)) {
				return element.value;
			}
		}

		return undefined;
	}

	/**
	 * Gets the specified element from the database.
	 * @param {string} key The key of the element to return from the database.
	 * @returns {Promise<*>} The value of the element, or `undefined` if the element cannot be found in the database.
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar');
	 * await endb.get('bar'); // undefined
	 * await endb.get('foo'); // 'bar'
	 */
	get(key) {
		key = addKeyPrefix(key, this.options.namespace);
		return Promise.resolve()
			.then(() => this.options.store.get(key))
			.then(data =>
				typeof data === 'string' ? this.options.deserialize(data) : data
			)
			.then(data => {
				if (data === undefined) return undefined;
				return data;
			});
	}

	/**
	 * Checks whether an element with the specified key exists in the database or not.
	 * @param {string} key The key of the element to test for presence in the database.
	 * @returns {Promise<boolean>} `true` if an element with the specified key exists in the database, otherwise false.
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar');
	 *
	 * await endb.has('bar'); // true
	 * await endb.has('baz'); // false
	 */
	async has(key) {
		key = addKeyPrefix(key, this.options.namespace);
		if (this.options.store instanceof Map) {
			const data = await this.options.store.has(key);
			return data;
		}

		return typeof (await this.get(key)) === 'object';
	}

	/**
	 * Performs a mathematical operation on the specified element in the database.
	 * @param {string} key The key of the element.
	 * @param {string} operation The mathematical operationto execute.
	 * Possible operations: addition, subtraction, multiply, division, exp, and module.
	 * @param {number} operand The operand of the operation
	 * @returns {Promise<true>}
	 * @example
	 * Endb.math('key', 'add', 100).then(console.log).catch(console.error);
	 *
	 * await Endb.math('key', 'add', 100);
	 * await Endb.math('key', 'div', 5);
	 * await Endb.math('key', 'subtract', 15);
	 * const element = await Endb.get('key');
	 * console.log(element); // 5
	 *
	 * const operations = ['add', 'sub', 'div', 'mult', 'exp', 'mod'];
	 * operations.forEach(operation => {
	 *   await Endb.math('key', operation, 100);
	 * });
	 */
	async math(key, operation, operand) {
		if (operation === 'random' || operation === 'rand') {
			const data = await this.set(key, Math.round(Math.random() * operand));
			return data;
		}

		const data = await this.set(
			key,
			_math(await this.get(key), operation, operand)
		);
		return data;
	}

	/**
	 * Creates multiple instances of Endb.
	 * @param {string[]} names An array of strings. Each element will create new instance.
	 * @param {Object} [options] The options for the instances.
	 * @returns {Object<Endb>} An object containing created instances.
	 * @example
	 * const { users, members } = Endb.multi(['users', 'members']);
	 * // With options
	 * const { users, members } = Endb.multi(['users', 'members'], {
	 *     adapter: 'sqlite'
	 * });
	 *
	 * await users.set('foo', 'bar');
	 * await members.set('bar', 'foo');
	 */
	static multi(names, options = {}) {
		const instances = {};
		for (const name of names) {
			instances[name] = new Endb(options);
		}

		return instances;
	}

	/**
	 * Sets an element with a specified key and a value to the database.
	 * @param {string} key The key of the element to add to the database.
	 * @param {*} value The value of the element to add to the database.
	 * @returns {Promise<true>} Returns `true`
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar'); // true
	 * await endb.set('exists', false);
	 * await endb.set('profile', {
	 *   id: 1234567890,
	 *   username: 'user',
	 *   verified: true,
	 *   nil: null,
	 *   hobbies: ['programming']
	 * });
	 */
	set(key, value) {
		key = addKeyPrefix(key, this.options.namespace);
		return Promise.resolve()
			.then(() => this.options.serialize(value))
			.then(value => this.options.store.set(key, value))
			.then(() => true);
	}
}

module.exports = Endb;
module.exports.Endb = Endb;
