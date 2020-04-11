declare module 'endb' {
	import { EventEmitter } from 'events';

	type FindPredicate<V> = (value: V, key: string) => boolean;
	type OrPromise<T> = Promise<T> | T;

	export interface EndbAdapter {
		on?(event: 'error', callback: (error: Error) => void | never): void;
		namespace: string;
		all<T>(): OrPromise<Element<T>[]>;
		clear(): OrPromise<void>;
		delete(key: string): OrPromise<boolean>;
		get(key: string): OrPromise<void | any>;
		has?(key: string): OrPromise<boolean>;
		set(key: string, value: any): OrPromise<unknown>;
	}

	export interface EndbOptions {
		uri?: string;
		namespace: string;
		serialize: (data: any) => any;
		deserialize: (data: any) => any;
		adapter?: string;
		store: EndbAdapter;
		collection?: string;
		table?: string;
		keySize?: number;
	}

	type Element<V> = {
		key: string;
		value: V;
	}

	export class Endb<T extends any> extends EventEmitter {
		public options: EndbOptions;
		constructor(options?: string | Partial<EndbOptions>);

	  /**
	   * Creates multiple instances of Endb.
	   * @param {string[]} names An array of strings. Each element will create new instance.
	   * @param {EndbOptions} [options=EndbOptions] The options for the instances.
	   * @return {Object} An object containing created Endb instances.
	   * @example
	   * const endb = Endb.multi(['users', 'members']);
	   * const endb = Endb.multi(['users', 'members'], {
	   *     uri: 'sqlite://endb.sqlite',
	   *     namespace: 'mydb'
	   * });
	   *
	   * await enbb.users.set('foo', 'bar');
	   * await endb.members.set('bar', 'foo');
	   */
		public static multi<T extends any>(
			names: string[],
			options?: Partial<EndbOptions>
		): Record<string, Endb<T>>;

	  /**
	   * Gets all the elements from the database.
	   * @return {Promise<any[]>} All the elements in the database.
	   */
		public all(): Promise<Element<T>[] | undefined>;

	  /**
	   * Clears all elements from the database.
	   * @return {Promise<undefined>} Returns `undefined`.
	   */
		public clear(): Promise<undefined>;

	  /**
	   * Deletes an element from the database by key.
	   * @param {string|string[]} key The key(s) of the element to remove from the database.
	   * @return {Promise<boolean>} `true` if the element is deleted successfully, otherwise `false`.
	   * @example
	   * await Endb.set('foo', 'bar'); // true
	   *
	   * await Endb.delete('foo'); // true
	   */
		public delete(key: string | string[]): Promise<boolean>;

		public entries(): Promise<readonly [string, T][]>;

	  /**
	   * Ensures if an element exists in the database. If the element does not exist, sets the element to the database and returns the value.
	   * @param {string} key The key of the element to ensure.
	   * @param {*} value The value of the element to ensure.
	   * @param {?string} [path]
	   * @return {Promise<any|undefined>} The (default) value of the element.
	   * @example
	   * await Endb.set('en', 'db');
	   *
	   * const data = await Endb.ensure('foo', 'bar');
	   * console.log(data); // 'bar'
	   *
	   * const data = await Endb.ensure('en', 'db');
	   * console.log(data); // 'db'
	   */
		public ensure<V>(
			key: string,
			value: V,
			path?: string
		): Promise<V | undefined>;

	  /**
	   * Finds a single item where the given function returns a truthy value.
	   * Behaves like {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find Array.prototype.find}.
	   * The database elements is mapped by their `key`. If you want to find an element by key, you should use the `get` method instead.
	   * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get MDN} for more details.
	   * @param {Function} fn The function to execute on each value in the element.
	   * @param {*} [thisArg] Object to use as `this` inside callback.
	   * @return {Promise<*|undefined>} The first element in the database that satisfies the provided testing function. Otherwise `undefined` is returned
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
		public find(
			fn: FindPredicate<T>,
			thisArg?: any
		): Promise<Element<T> | undefined>;

	  /**
	   * Gets the value of an element from the database by key.
	   * @param {string} key The key of the element to get.
	   * @param {?string} [path] The path of the property to get from the value.
	   * @return {Promise<*|undefined>} The value of the element, or `undefined` if the element cannot be found in the database.
	   * @example
	   * const data = await Endb.get('foo');
	   * console.log(data); // 'bar'
	   *
	   * // Using path feature
	   * await Endb.get('profile', 'verified'); // false
	   */
		public get<V>(key: string, path?: string): Promise<V | undefined>;

	  /**
	   * Checks whether an element exists in the database or not.
	   * @param {string} key The key of an element to check for.
	   * @param {?string} [path] The path of the property to check.
	   * @return {Promise<boolean>} `true` if the element exists in the database, otherwise `false`.
	   */
		public has(key: string, path?: string): Promise<boolean>;

	  /**
	   * Returns an array that contains the keys of each element.
	   * @return {Promise<string[]>} An array that contains the keys of each element.
	   */
		public keys(): Promise<string[]>;

	  /**
	   * Performs a mathematical operation on a value of an element.
	   * @param {string} key The key of the element.
	   * @param {string} operation The mathematical operation to perform.
	   * @param {number} operand The right-hand operand.
	   * @param {?string} [path] The path of the property to perform mathematical operation on.
	   * @return {true} Returns `true`.
	   * @example
	   * balance.set('endb', 100);
	   *
	   * balance.math('endb', 'add', 100); // true
	   */
		public math(
			key: string,
			operation: string,
			operand: number,
			path?: string
		): Promise<true>;

	  /**
	   * Pushes an item to the array value in the database.
	   * @param {string} key The key of the element to push to.
	   * @param {*} value The value to push.
	   * @param {?string} [path] The path of the property of the value to push.
	   * @param {boolean} [allowDuplicates=false] Whether or not, allow duplicates elements in the value.
	   * @return {Promise<*>} The value to push.
	   */
		public push<T>(
			key: string,
			value: T,
			path?: string,
			allowDuplicates?: boolean
		): Promise<T>;

	  /**
	   * Removes an item from the array value of an element in the database.
	   * Note: structured or complex data types such as arrays or objects cannot be removed from the value of the element.
	   * @param {string} key The key of the element to remove.
	   * @param {*} value The value to remove. Must be a string.
	   * @param {?string} [path] The path of the property to remove.
	   * @return {Promise<*>} The value to remove.
	   */
		public remove(key: string, value: string, path?: string): Promise<any>;

	  /**
	   * Sets an element to the database.
	   * @param {string} key The key of the element to set to the database.
	   * @param {*} value The value of the element to set to the database.
	   * @param {?string} [path] The path of the property to set in the value.
	   * @return {Promise<true>} Returns `true`.
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
	   * await Endb.set('profile', false, 'verified');
	   * await Endb.set('profile', 100, 'balance');
	   */
		public set(key: string, value: any, path?: string): Promise<true>;

	  /**
	   * Returns an array that contains the values of each element.
	   * @return {Promise<any[]>} Array that contains the values of each element.
	   */
		public values(): Promise<T[]>;
	}
}