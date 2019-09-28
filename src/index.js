'use strict';

const EventEmitter = require('events');
const { addKeyPrefix, removeKeyPrefix, load, math, parse, stringify, colorize } = require('./util');

/**
 * @class Endb
 * @classdesc Simple key-value database with cache and multi adapter support.
 * @extends EventEmitter
 */
class Endb extends EventEmitter {

    /**
     * @constructor
     * @param {string} [uri] The connection string URI. (Default: undefined)
     * @param {Object} [options] The options for the database. (Default: {})
     * @param {string} [options.namespace] The name of the database. (Default: endb)
     * @param {Function} [options.serialize] A custom serialization function.
     * @param {Function} [options.deserialize] A custom deserialization function.
     * @param {string} [options.adapter] The adapter to be used.
     * @param {string} [options.collection] The name of the collection. (MongoDB)
     * @param {string} [options.table] The name of the table. (SQL database)
     * @param {number} [options.keySize] The size of the key. (SQL database)
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
     */
    constructor(uri, options = {}) {
        super();
        this.options = Object.assign({
            namespace: 'endb',
            serialize: stringify,
            deserialize: parse,
        }, (typeof uri === 'string') ? { uri } : uri, options);
        if (!this.options.store) {
            this.options.store = load(Object.assign({}, this.options));
        }
        if (typeof this.options.store.on === 'function') {
            this.options.store.on('error', err => this.emit('error', err));
        }
        this.options.store.namespace = this.options.namespace;
    }

    /**
     * Gets all the elements (keys and values) from the database.
     * @returns {Promise<Object>} All the elements (keys and values).
     * @example
     * Endb.all().then(console.log).catch(console.error);
     */
    all() {
        return Promise.resolve()
            .then(() => {
                console.log(colorize('Endb#all() is an experimental function; if you find any bug, please report it.').yellow);
                if (this.options.store instanceof Map) {
                    const obj = {};
                    for (const [key, value] of this.options.store) {
                        obj[removeKeyPrefix({ key, namespace: this.options.namespace })] = this.options.deserialize(value).value;
                    }
                    return obj;
                }
                return this.options.store.all();
            })
            .then(data => {
                data = typeof data === 'string' ? this.options.deserialize(data) : data;
                return data === undefined ? undefined : data;
            });
    }

    /**
     * Deletes all the elements (keys and values) from the database.
     * @returns {Promise<void>} Returns undefined
     * @example
     * Endb.clear().then(console.log).catch(console.error);
     */
    clear() {
        return Promise.resolve()
            .then(() => this.options.store.clear());
    }

    /**
     * Deletes an element (key and value) from the database.
     * @param {string} key The key of an element.
     * @returns {Promise<true>} Whether or not, the key has been deleted.
     * @example
     * Endb.delete('key').then(console.log).catch(console.error);
     */
    delete(key) {
        if (typeof key !== 'string') throw new TypeError('Key must be a string');
        key = addKeyPrefix({ key, namespace: this.options.namespace });
        return Promise.resolve()
            .then(() => this.options.store.delete(key));
    }

    /**
     * Gets an element (key and value) from the database.
     * @param {string} key The key of the element.
     * @param {Object} [options={}] The options for the get.
     * @param {boolean} [options.raw=false] Get data as raw or not.
     * @returns {Promise<*>} The value of the element.
     * @example
     * Endb.get('key').then(console.log).catch(console.error);
     */
    get(key, options = {}) {
        if (typeof key !== 'string') throw new TypeError('Key must be a string');
        key = addKeyPrefix({ key, namespace: this.options.namespace });
        return Promise.resolve()
            .then(() => this.options.store.get(key))
            .then(data => {
                data = typeof data === 'string' ? this.options.deserialize(data) : data;
                if (data === undefined)
                    return undefined;
                return (options && options.raw) ? data : data.value;
            });
    }

    /**
     * Checks if the database has an element (key and value).
     * @param {string} key The key of the element.
     * @returns {Promise<boolean>} Whether or not, the element exists in the database.
     * @example
     * Endb.has('key').then(console.log).catch(console.error);
     *
     * const element = await Endb.has('key');
     * if (element) {
     *     console.log('exists');
     * } else {
     *     console.log('does not exist');
     * }
     */
    has(key) {
        if (typeof key !== 'string') throw new TypeError('Key must be a string');
        key = addKeyPrefix({ key, namespace: this.options.namespace });
        return Promise.resolve()
            .then(() => {
                if (this.options.store instanceof Map) {
                    return this.options.store.has(key);
                }
                const data = this.get(key);
                return data ? true : false;
            });
    }

    /**
     * Performs a mathematical operation on an element.
     * @param {string} key The key of the element.
     * @param {string} operation The mathematical operationto execute.
     * Possible operations: add, sub, multiply, div, exp, and module.
     * @param {number} operand The operand of the operation
     * @returns {Promise<boolean>}
     * @example
     * await Endb.set('key', 0);
     * await Endb.math('key', 'add', 100);
     * await Endb.math('key', 'div', 5);
     * await Endb.math('key', 'subtract', 15);
     * const element = await Endb.get('key');
     * console.log(element); // 5
     */
    async math(key, operation, operand) {
        if (typeof key !== 'string') throw new TypeError('Key must be a string');
        if (operation === 'random' || operation === 'rand') {
            return await this.set(key, Math.round(Math.random() * operand));
        }
        return await this.set(key, math(await this.get(key), operation, operand));
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
        if (!names.length || names.length < 1) {
            throw new TypeError('Names must be an array of strings');
        }
        const instances = {};
        for (const name of names) {
            instances[name] = new Endb(options);
        }
        return instances;
    }

    /**
     * Sets an element (key and a value) to the database.
     * @param {string} key The key of the element.
     * @param {*} value The value of the element.
     * @returns {Promise<boolean>} Whether or not, the element has been assigned.
     * @example
     * Endb.set('key', 'value').then(console.log).catch(console.error);
     * Endb.set('userExists', true).then(console.log).catch(console.error);
     * Endb.set('profile', {
     *   id: 1234567890,
     *   username: 'user',
     *   description: 'A test user',
     *   verified: true
     * }).then(console.log).catch(console.error);
     */
    set(key, value) {
        if (typeof key !== 'string') {
            throw new TypeError('Key must be a string');
        }
        key = addKeyPrefix({ key, namespace: this.options.namespace });
        return Promise.resolve()
            .then(() => {
                return this.options.store.set(key, this.options.serialize({ value }));
            })
            .then(() => true);
    }
}

module.exports = Endb;
module.exports.Endb = Endb;
module.exports.util = require('./util');