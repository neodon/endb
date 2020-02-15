'use strict';

const {EventEmitter} = require('events');
const {
	addKeyPrefix,
	get: _get,
	load,
	math,
	parse,
	removeKeyPrefix,
	set: _set,
	stringify,
	validateOptions
} = require('./util');

/**
 * Simple key-value database with cache and multi adapter support.
 * @extends EventEmitter
 */
class Endb extends EventEmitter {
	/**
	 * @param {EndbOptions} [options={}] The options for the Endb instance.
	 */
	constructor(options = {}) {
		super();

		/**
		 * The options for the Endb.
		 * @typedef {Object} EndbOptions
		 * @property {string} [uri] The connection URI of the database.
		 * @property {string} [namespace='endb'] The namespace of the database.
		 * @property {string} [adapter] The storage adapter or backend to use.
		 * @property {*} [store=Map]
		 * @property {Function} [serialize=Util#stringify] A data serialization function.
		 * @property {Function} [deserialize=Util#parse] A data deserialization function.
		 * @property {string} [collection='endb'] The name of the collection. Only works for MongoDB.
		 * @property {string} [table='endb'] The name of the table. Only works for SQL databases.
		 * @property {number} [keySize=255] The maximum size of the keys of elements.
		 */

		/**
		 * The options for Endb.
		 * @type {EndbOptions}
		 */
		this.options = Object.assign(
			{
				namespace: 'endb',
				serialize: stringify,
				deserialize: parse
			},
			typeof options === 'string' ? {uri: options} : options
		);
		validateOptions(this.options);

		if (!this.options.store) {
			this.options.store = load(Object.assign({}, this.options));
		}

		if (typeof this.options.store.on === 'function') {
			this.options.store.on('error', error => this.emit('error', error));
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
	 * await Endb.set('foo','bar');
	 *
	 * await Endb.clear();
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
		if (typeof key !== 'string') {
			throw new TypeError('Key must be a string');
		}

		key = addKeyPrefix(key, this.options.namespace);
		return Promise.resolve().then(() => {
			if (Array.isArray(key)) {
				return Promise.all(key.map(k => this.options.store.delete(k)));
			}

			return this.options.store.delete(key);
		});
	}

	/**
	 * Ensures if an element exists in the database. If the element does not exist, sets the element to the database and returns the value.
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
		if (value === null) {
			throw new TypeError('Value must be provided.');
		}

		const exists = await this.has(key);
		if (!exists) {
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
		if (typeof thisArg !== 'undefined') {
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
	 * const data = await Endb.get('foo');
	 * console.log(data); // 'bar'
	 *
	 * await Endb.get('profile', 'verified'); // false
	 */
	get(key, path = null) {
		if (typeof key !== 'string') {
			throw new TypeError('Endb#get: key must be a string.');
		}

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
	 * await Endb.set('foo', 'bar');
	 *
	 * await Endb.has('foo'); // true
	 * await Endb.has('baz'); // false
	 */
	async has(key) {
		if (typeof key !== 'string') {
			throw new TypeError('Key must be a string');
		}

		if (this.options.store instanceof Map) {
			const res = await this.options.store.has(
				addKeyPrefix(key, this.options.namespace)
			);
			return res;
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
	 * @param {string} operation The mathematical operation to execute.
	 * Possible operations: addition, subtraction, multiply, division, exp, and module.
	 * @param {number} operand The operand of the operation.
	 * @param {string} [path=null]
	 * @returns {Promise<number>} The operand of the operation.
	 * @example
	 * await Endb.set('balance', 0);
	 *
	 * await Endb.math('balance', 'add', 100);
	 * await Endb.math('balance', 'div', 5);
	 * await Endb.math('balance', 'subtract', 15);
	 *
	 * const element = await Endb.get('balance');
	 * console.log(element); // 5
	 */
	async math(key, operation, operand, path = null) {
		const value = await this.get(key);
		if (path === null) {
			if (operation === 'random' || operation === 'rand') {
				await this.set(key, Math.round(Math.random() * operand));
				return operand;
			}

			await this.set(key, math(value, operation, operand));
			return operand;
		}

		const propValue = _get(value, path);
		if (operation === 'random' || operation === 'rand') {
			await this.set(key, Math.round(Math.random() * propValue), path);
			return operand;
		}

		await this.set(key, math(propValue, operation, operand), path);
		return operand;
	}

	/**
	 * Creates multiple instances of Endb.
	 * @param {string[]} names An array of strings. Each element will create new instance.
	 * @param {Object} [options=EndbOptions] The options for the instances.
	 * @returns {Object<Endb>} An object containing created instances.
	 * @example
	 * const { users, members } = Endb.multi(['users', 'members']);
	 * const { users, members } = Endb.multi(['users', 'members'], {
	 *     uri: 'sqlite://endb.sqlite',
	 *     namespace: 'mydb'
	 * });
	 *
	 * await users.set('foo', 'bar');
	 * await members.set('bar', 'foo');
	 */
	static multi(names, options = {}) {
		if (!Array.isArray(names) || names.length === 0) {
			throw new TypeError('Names must be an array of strings.');
		}

		const instances = {};
		for (const name of names) {
			instances[name] = new Endb(options);
		}

		return instances;
	}

	/**
	 * Pushes an item to the array value in the database.
	 * @param {string} key The key of the element to push to.
	 * @param {*} value The value to push.
	 * @param {string} [path=null]
	 * @return {Promise<*>} The value to push.
	 */
	async push(key, value, path = null) {
		const data = await this.get(key);
		if (path !== null) {
			const propValue = _get(data, path);
			if (!Array.isArray(propValue)) {
				throw new TypeError('Target must be an array.');
			}

			propValue.push(value);
			_set(data, path, propValue);
		} else {
			if (!Array.isArray(data)) {
				throw new TypeError('Target must be an array.');
			}

			data.push(value);
		}

		await this.set(key, data);
		return value;
	}

	/**
	 * Removes an item from the array value in the database.
	 * @param {string} key The key of the element to push to.
	 * @param {*} value The value to push.
	 * @param {string} [path=null]
	 * @return {Promise<*>} The value to push.
	 */
	async remove(key, value, path = null) {
		const data = await this.get(key);
		if (path !== null) {
			const propValue = _get(data, path);
			if (!Array.isArray(propValue)) {
				throw new TypeError('Target must be an array.');
			}

			propValue.splice(propValue.indexOf(value), 1);
			_set(data, path, propValue);
		} else {
			if (!Array.isArray(data)) {
				throw new TypeError('Target must be an array.');
			}

			if (data.includes(value)) {
				data.splice(data.indexOf(value), 1);
			} else if (data !== null && typeof data === 'object') {
				delete data[value];
			}
		}

		await this.set(key, data);
		return value;
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
		if (typeof key !== 'string') {
			throw new TypeError('Key must be a string.');
		}

		key = addKeyPrefix(key, this.options.namespace);
		if (path !== null) {
			const data = this.options.store.get(key);
			value = _set(
				typeof data === 'string' ? this.options.deserialize(data) : data || {},
				path,
				value
			);
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
module.exports.Util = require('./util');
