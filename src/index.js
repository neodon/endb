'use strict';

const {EventEmitter} = require('events');
const {
	addKeyPrefix,
	get: _get,
	load,
	math: _math,
	parse,
	removeKeyPrefix,
	set: _set,
	stringify
} = require('./util');

/**
 * Simple key-value database with cache and multi adapter support.
 * @extends EventEmitter
 */
class Endb extends EventEmitter {
	/**
	 * @constructor
	 * @param {string} [uri=undefined] The connection string URI.
	 * @param {Object} [options={}] The options for the database.
	 * @param {string} [options.namespace=endb] The name of the database.
	 * @param {Function} [options.serialize=Util#stringify] A custom serialization function.
	 * @param {Function} [options.deserialize=Util#parse] A custom deserialization function.
	 * @param {string} [options.adapter] The adapter to be used.
	 * @param {string} [options.collection=endb] The name of the collection. (only for MongoDB)
	 * @param {string} [options.table=endb] The name of the table. (only for SQL adapters)
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
	 * @returns {Promise<any[]>} All the elements from the database.
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
			.then(data => (data === undefined ? undefined : data));
	}

	/**
	 * Clears all elements from the database.
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
	 * Removes the element from the database by key.
	 * @param {string|string[]} key The key(s) of the element to remove from the database.
	 * @returns {Promise<boolean|boolean[]>} `true` if the element(s) in the database existed and has been deleted, or `false` if the element(s) does not exist or has not been deleted.
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar'); // true
	 *
	 * await endb.delete('foo'); // true
	 * await endb.delete(['foo', 'fizz']); // [ true, false ]
	 */
	delete(key) {
		key = addKeyPrefix(key, this.options.namespace);
		return Promise.resolve().then(() => {
			if (Array.isArray(key)) {
				return Promise.all(key.map(k => this.options.store.delete(k)));
			}

			return this.options.store.delete(key);
		});
	}

	/**
	 * Ensures if an element exists in the database. If the element does not exist, sets the element to the database.
	 * @param {string} key The key of the element to ensure.
	 * @param {*} value The value of the element to ensure.
	 * @return {Promise<*>} The (default) value of the element.
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('en', 'db');
	 *
	 * const data = await endb.ensure('foo', 'bar');
	 * console.log(data); // 'bar'
	 *
	 * const data = await endb.ensure('en', 'db');
	 * console.log(data); // 'db'
	 */
	async ensure(key, value) {
		const dataExists = await this.has(key);
		if (!dataExists) {
			await this.set(key, value);
			return value;
		}

		const data = await this.get(key);
		return data;
	}

	/**
	 * Finds a single item where the given function returns a truthy value.
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
	 * Gets the value of an element from the database.
	 * @param {string} key The key of the element to get from the database.
	 * @param {string} [path=null] The path of the property to get from the value.
	 * @returns {Promise<*>} The value of the element, or `undefined` if the element cannot be found in the database.
	 * @example
	 * await Endb.set('foo', 'bar');
	 *
	 * const data = await Endb.get('foo');
	 * console.log(data); // 'bar'
	 *
	 * await Endb.get('profile', 'verified'); // false
	 */
	get(key, path = null) {
		key = addKeyPrefix(key, this.options.namespace);
		return Promise.resolve()
			.then(() => this.options.store.get(key))
			.then(data =>
				typeof data === 'string' ? this.options.deserialize(data) : data
			)
			.then(data => (path === null ? data : _get(data, path)))
			.then(data => (data === undefined ? undefined : data));
	}

	/**
	 * Checks whether an element, by key, exists in the database or not.
	 * @param {string} key The key of the element to test for presence in the database.
	 * @returns {Promise<boolean>} `true` if an element, by key, exists in the database, otherwise `false`.
	 * @example
	 * const endb = new Endb();
	 *
	 * await endb.set('foo', 'bar');
	 *
	 * await endb.has('bar'); // true
	 * await endb.has('baz'); // false
	 */
	async has(key) {
		if (this.options.store instanceof Map) {
			key = addKeyPrefix(key, this.options.namespace);
			const data = await this.options.store.has(key);
			return data;
		}

		return Boolean(await this.get(key));
	}

	async keys() {
		const data = await this.all();
		return data.map(element => element.key);
	}

	/**
	 * Performs a mathematical operation on the element in the database.
	 * @param {string} key The key of the element.
	 * @param {string} operation The mathematical operationto execute.
	 * Possible operations: addition, subtraction, multiply, division, exp, and module.
	 * @param {number} operand The operand of the operation
	 * @param {string} [path=null]
	 * @returns {Promise<true>} Returns true.
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
	async math(key, operation, operand, path = null) {
		if (path === null) {
			if (operation === 'random' || operation === 'rand') {
				const data = await this.set(key, Math.round(Math.random() * operand));
				return data;
			}

			return this.set(key, _math(this.get(key), operation, operand));
		}

		const data = await this.get(key);
		const propValue = _get(data, path);
		if (operation === 'random' || operation === 'rand') {
			const data = await this.set(
				key,
				Math.round(Math.random() * operand),
				path
			);
			return data;
		}

		const res = await this.set(key, _math(propValue, operation, operand), path);
		return res;
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
	 * Pushes an element to the array value in the database.
	 * @param {string} key The key of the element to push to the database.
	 * @param {*} value The value of the element to push.
	 * @param {boolean} [allowDupes=false] Whether to allow duplicate elements in the array or not.
	 * @return {Promise<true>}
	 */
	async push(key, value, allowDupes = false) {
		const data = await this.get(key);
		if (!Array.isArray(data)) {
			throw new TypeError('Target must be an array.');
		}

		if (!allowDupes && data.includes(value)) return;
		data.push(value);
		const res = await this.set(key, data);
		return res;
	}

	/**
	 * @param {string} key
	 * @param {*} value
	 * @return {Promise<true>}
	 */
	async remove(key, value) {
		const data = await this.get(key);
		if (['Array', 'Object'].includes(data.constructor.name)) {
			throw new TypeError('Target must be an object or an array.');
		}

		if (Array.isArray(data)) {
			if (data.includes(value)) {
				data.splice(data.indexOf(value), 1);
			}
		} else if (data.constructor.name === 'Array') {
			delete data[value];
		}

		const res = await this.set(key, data);
		return res;
	}

	/**
	 * Sets an element, key and value, to the database.
	 * @param {string} key The key of the element to set to the database.
	 * @param {*} value The value of the element to set to the database.
	 * @param {string} [path=null] The path of the property to set in the value.
	 * @returns {Promise<true>} Returns `true`.
	 * @example
	 * await Endb.set('foo', 'bar');
	 * await Endb.set('total', 400);
	 * await Endb.set('exists', false);
	 * await Endb.set('profile', {
	 *   id: 1234567890,
	 *   username: 'user',
	 *   verified: true,
	 *   nil: null
	 * });
	 * await Endb.set('todo', [ 'Add a authentication system.', 'Refactor the generator' ]);
	 *
	 * await endb.set('profile', false, 'verified');
	 * await endb.set('profile', 100, 'balance');
	 */
	set(key, value, path = null) {
		key = addKeyPrefix(key, this.options.namespace);
		if (path !== null) {
			let data = this.options.store.get(key);
			data = typeof data === 'string' ? this.options.deserialize(data) : data;
			value = _set(data || {}, path, value);
		}

		return Promise.resolve()
			.then(() => this.options.serialize(value))
			.then(value => this.options.store.set(key, value))
			.then(() => true);
	}

	async values() {
		const data = await this.all();
		return data.map(element => element.value);
	}
}

module.exports = Endb;
module.exports.Endb = Endb;
module.exports.Util = require('./util');
