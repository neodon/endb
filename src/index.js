'use strict';

const {EventEmitter} = require('events');
const {Util, EndbOptions} = require('./util');

/**
 * Simple key-value database with cache and multi adapter support.
 * @extends EventEmitter
 */
class Endb extends EventEmitter {
	/**
	 * @param {EndbOptions} [options={}] The options for the database.
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
	 * // Handles connection errors
	 * endb.on('error', err => console.log('Connection Error: ', err));
	 *
	 * await endb.set('foo', 'bar'); // true
	 * await endb.get('foo'); // 'bar'
	 * await endb.all(); // [ ... ]
	 * await endb.has('foo'); // true
	 * await endb.delete('foo'); // true
	 * await endb.clear(); // undefined
	 */
	constructor(options = {}) {
		super();

		if (typeof options === 'string') {
			options = {uri: options};
		}

		/**
		 * The options for an Endb instance.
		 * @type {EndbOptions}
		 */
		this.options = Util.mergeDefault(
			EndbOptions,
			typeof options === 'string' ? {uri: options} : options
		);
		Util.validateOptions(this.options);

		if (!this.options.store) {
			this.options.store = Util.load(this.options);
		}

		if (typeof this.options.store.on === 'function') {
			this.options.store.on('error', err => this.emit('error', err));
		}
	}

	/**
	 * Gets all the elements from the database.
	 * @returns {Promise<Array<*>>} All the elements from the database.
	 * @example
	 * await Endb.set('foo', 'bar');
	 * await Endb.set('en', 'db');
	 *
	 * await Endb.all(); // [ { key: 'foo', value: 'bar' }, { key: 'en', value: 'db' } ]
	 */
	all() {
		return Promise.resolve()
			.then(() => {
				if (this.options.store instanceof Map) {
					const arr = [];
					for (const [key, value] of this.options.store) {
						arr.push({
							key: Util.removeKeyPrefix(key, this.options.namespace),
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
	 * await Endb.set('foo','bar');
	 * await Endb.set('key', 'val');
	 *
	 * await Endb.clear(); // true
	 *
	 * await Endb.has('foo');
	 */
	clear() {
		return Promise.resolve().then(() => this.options.store.clear());
	}

	/**
	 * Removes/deletes the element from the database by key.
	 * @param {string|string[]} key The key(s) of the element to remove from the database.
	 * @returns {Promise<boolean|boolean[]>} `true` if the element(s) in the database existed and has been deleted, or `false` if the element(s) does not exist or has not been deleted.
	 * @example
	 * await Endb.set('foo', 'bar'); // true
	 *
	 * await Endb.delete('foo'); // true
	 * await Endb.delete(['foo', 'fizz']); // [ true, false ]
	 */
	delete(key) {
		key = Util.addKeyPrefix(key, this.options.namespace);
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
	 * await Endb.set('en', 'db');
	 *
	 * const data = await Endb.ensure('foo', 'bar');
	 * console.log(data); // 'bar'
	 *
	 * const data = await Endb.ensure('en', 'db');
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
	 * await Endb.set('foo', 'bar');
	 * await Endb.set('profile', {
	 *   id: 1234567890,
	 *   username: 'user',
	 *   verified: true,
	 *   nil: null,
	 *   hobbies: ['programming']
	 * });
	 *
	 * await Endb.find(v => v === 'bar'); // { key: 'foo', value: 'bar' }
	 * await Endb.find(v => v.verified === true); // { key: 'profile', value: { ... } }
	 * await Endb.find(v => v.desc === 'desc'); // undefined
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
	 * Gets the value of an element from the database by key.
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
		key = Util.addKeyPrefix(key, this.options.namespace);
		return Promise.resolve()
			.then(() => this.options.store.get(key))
			.then(data =>
				typeof data === 'string' ? this.options.deserialize(data) : data
			)
			.then(data => (path === null ? data : Util.get(data, path)))
			.then(data => (data === undefined ? undefined : data));
	}

	/**
	 * Checks whether an element, by key, exists in the database or not.
	 * @param {string} key The key of the element to test for presence in the database.
	 * @returns {Promise<boolean>} `true` if an element, by key, exists in the database, otherwise `false`.
	 * @example
	 * await Endb.set('foo', 'bar');
	 *
	 * await Endb.has('bar'); // true
	 * await Endb.has('baz'); // false
	 */
	async has(key) {
		if (this.options.store instanceof Map) {
			key = Util.addKeyPrefix(key, this.options.namespace);
			const data = await this.options.store.has(key);
			return data;
		}

		return Boolean(await this.get(key));
	}

	/**
	 * @return {Promise<string[]>}
	 */
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
	 * await Endb.math('key', 'add', 100);
	 * await Endb.math('key', 'div', 5);
	 * await Endb.math('key', 'subtract', 15);
	 *
	 * const element = await Endb.get('key');
	 * console.log(element); // 5
	 *
	 * const operations = ['+', '-', '/', '*', '^', '%'];
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

			return this.set(key, Util._math(this.get(key), operation, operand));
		}

		const data = await this.get(key);
		const propValue = Util.get(data, path);
		if (operation === 'random' || operation === 'rand') {
			const data = await this.set(
				key,
				Math.round(Math.random() * operand),
				path
			);
			return data;
		}

		const res = await this.set(
			key,
			Util._math(propValue, operation, operand),
			path
		);
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
	 *     namespace: 'mydb',
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
	 * @param {string} [path=null]
	 * @param {boolean} [allowDupes=false] Whether to allow duplicate elements in the array or not.
	 * @return {Promise<true>}
	 */
	async push(key, value, path = null, allowDupes = false) {
		const data = await this.get(key);
		if (path !== null) {
			const propValue = Util.get(data, path);
			if (!Array.isArray(propValue)) {
				throw new TypeError('Target must be an array.');
			}

			if (!allowDupes && propValue.includes(value)) {
				throw new Error(
					'Endb#push: duplicates elements cannot be pushed. Use "allowDupes" option to disable this.'
				);
			}

			propValue.push(value);
			Util.set(data, path, propValue);
		} else {
			if (!allowDupes && data.includes(value)) {
				throw new Error(
					'Endb#push: duplicates elements cannot be pushed. Use "allowDupes" option to disable this.'
				);
			}

			data.push(value);
		}

		const res = await this.set(key, data);
		return res;
	}

	/**
	 * @param {string} key
	 * @param {*} value
	 * @param {string} [path=null]
	 * @return {Promise<true>}
	 */
	async remove(key, value, path = null) {
		const data = await this.get(key);
		if (path !== null) {
			const propValue = Util.get(data, path);
			if (!Array.isArray(propValue)) {
				throw new TypeError('Endb#remove: target must be an array.');
			}

			propValue.splice(propValue.indexOf(value), 1);
			Util.set(data, path, propValue);
		} else if (Array.isArray(data)) {
			if (data.includes(value)) {
				data.splice(data.indexOf(value), 1);
			} else if (Util.isObject(data)) {
				delete data[value];
			}
		}

		const res = await this.set(key, data);
		return res;
	}

	/**
	 * Sets an element to the database.
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
		key = Util.addKeyPrefix(key, this.options.namespace);
		if (path !== null) {
			let data = this.options.store.get(key);
			data = typeof data === 'string' ? this.options.deserialize(data) : data;
			value = Util.set(data || {}, path, value);
		}

		return Promise.resolve()
			.then(() => this.options.serialize(value))
			.then(value => this.options.store.set(key, value))
			.then(() => true);
	}

	/**
	 * @return {Promise<any[]>}
	 */
	async values() {
		const data = await this.all();
		return data.map(element => element.value);
	}
}

module.exports = Endb;
module.exports.Endb = Endb;
module.exports.Util = Util;

/**
 * Emitted for database connection errors.
 * @event Endb#error
 * @param {Error} err The error information.
 */
