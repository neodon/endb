'use strict';

module.exports = class Util {
	static addKeyPrefix(key, namespace) {
		if (key === null) {
			return null;
		}

		return namespace ? `${namespace}:${key}` : key;
	}

	static isArrayLike(obj) {
		if (!obj) {
			return false;
		}

		return (
			Array.isArray(obj) ||
			Array.isArray(obj) ||
			(obj.length >= 0 && obj.splice instanceof Function)
		);
	}

	static isBufferLike(x) {
		return (
			typeof x === 'object' &&
			x !== null &&
			x.type === 'Buffer' &&
			(Array.isArray(x.data) || typeof x.data === 'string')
		);
	}

	static isObject(value) {
		const type = typeof value;
		return value !== null && (type === 'object' || type === 'function');
	}

	static load(options) {
		const adapters = {
			level: './adapters/leveldb',
			leveldb: './adapters/leveldb',
			mongo: './adapters/mongodb',
			mongodb: './adapters/mongodb',
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

	static parse(text) {
		return JSON.parse(text, (k, v) => {
			if (Util.isBufferLike(v)) {
				if (Array.isArray(v.data)) {
					return Buffer.from(v.data);
				}

				if (typeof v.data === 'string') {
					if (v.data.startsWith('base64:')) {
						return Buffer.from(v.data.slice('base64:'.length), 'base64');
					}

					return Buffer.from(v.data);
				}
			}

			return v;
		});
	}

	static removeKeyPrefix(key, namespace) {
		if (key === null) {
			return null;
		}

		return namespace ? key.replace(`${namespace}:`, '') : key;
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
			(k, v) => {
				if (Util.isBufferLike(v)) {
					if (Array.isArray(v.data)) {
						if (v.data.length > 0) {
							v.data = `base64:${Buffer.from(v.data).toString('base64')}`;
						} else {
							v.data = '';
						}
					}
				}

				return v;
			},
			space
		);
	}
};
