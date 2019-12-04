'use strict';

module.exports = class Util {
	static addKeyPrefix(key, namespace) {
		return `${namespace}:${key}`;
	}

	static isBufferLike(x) {
		return (
			Util.isObject(x) &&
			x.type === 'Buffer' &&
			(Array.isArray(x.data) || typeof x.data === 'string')
		);
	}

	static isObject(x) {
		return typeof x === 'object' && x !== null;
	}

	static load(options) {
		const adapters = {
			level: './adapters/leveldb',
			leveldb: './adapters/leveldb',
			mongo: './adapters/mongodb',
			mongodb: './adapters/mongodb',
			nedb: './adapters/nedb',
			mysql: './adapters/mysql',
			mysql2: './adapters/mysql',
			postgres: './adapters/postgres',
			postgresql: './adapters/postgres',
			redis: './adapters/redis',
			sqlite: './adapters/sqlite',
			sqlite3: './adapters/sqlite'
		};
		if (options.adapter || options.uri) {
			const adapter = options.adapter || /^[^:]*/.exec(options.uri)[0];
			if (adapters[adapter] !== undefined) {
				return new (require(adapters[adapter]))(options);
			}
		}

		return new Map();
	}

	static parse(text) {
		return JSON.parse(text, (_key, value) => {
			if (Util.isBufferLike(value)) {
				if (Array.isArray(value.data)) {
					return Buffer.from(value.data);
				}

				if (typeof value.data === 'string') {
					if (value.data.startsWith('base64:')) {
						return Buffer.from(value.data.slice('base64:'.length), 'base64');
					}

					return Buffer.from(value.data);
				}
			}

			return value;
		});
	}

	static math(base, op, opand) {
		switch (op) {
			case 'add':
			case 'addition':
			case '+':
				return base + opand;
			case 'sub':
			case 'subtract':
			case '-':
				return base - opand;
			case 'mult':
			case 'multiply':
			case '*':
				return base * opand;
			case 'div':
			case 'divide':
			case '/':
				return base / opand;
			case 'exp':
			case 'exponent':
			case '^':
				return base ** opand;
			case 'mod':
			case 'modulo':
			case '%':
				return base % opand;
			default:
				throw new Error('Must pass an operation');
		}
	}

	static removeKeyPrefix(key, namespace) {
		return key.replace(`${namespace}:`, '');
	}

	static safeRequire(id) {
		try {
			return require(id);
		} catch {
			console.error(
				`Install ${id} to continue; run "npm install ${id}" to install it.`
			);
			return undefined;
		}
	}

	static stringify(value, space) {
		return JSON.stringify(
			value,
			(_key, value) => {
				if (Util.isBufferLike(value)) {
					if (Array.isArray(value.data)) {
						if (value.data.length > 0) {
							value.data = `base64:${Buffer.from(value.data).toString(
								'base64'
							)}`;
						} else {
							value.data = '';
						}
					}
				}

				return value;
			},
			space
		);
	}
};
