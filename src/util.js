'use strict';

class Util {
    constructor() {
        throw new Error('Util class cannot be constructed');
    }

    static safeRequire(id) {
        try {
            return require(id);
        } catch (err) {
            console.error('\x1b[2m\x1b[32m%s\x1b[0m',
                `To continue, you'll have to install ${id}. Run "npm install ${id}" to install it.`);
            return false;
        }
    }

    static parse(text) {
        return JSON.parse(text, (k, v) => {
            if (Util.isBufferLike(v)) {
                if (Array.isArray(v.data)) {
                    return Buffer.from(v.data);
                } else if (typeof v.data === 'string') {
                    if (v.data.startsWith('base64:')) {
                        return Buffer.from(v.data.slice('base64:'.length), 'base64');
                    }
                    return Buffer.from(v.data);
                }
            }
            return v;
        });
    }

    static stringify(value, space) {
        return JSON.stringify(value, (k, v) => {
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
        }, space);
    }

    static isBufferLike(x) {
        return (typeof x === 'object' && x !== null && x.type === 'Buffer' && (Array.isArray(x.data) || typeof x.data === 'string'));
    }

    static load(options = {}) {
        const adapters = {
            level: './adapters/leveldb',
            leveldb: './adapters/leveldb',
            mongo: './adapters/mongodb',
            mongodb: './adapters/mongodb',
            mysql: './adapters/mysql',
            postgres: './adapters/postgres',
            postgresql: './adapters/postgres',
            redis: './adapters/redis',
            sqlite: './adapters/sqlite',
            sqlite3: './adapters/sqlite',
        };
        if (options.adapter || options.uri) {
            const adapter = options.adapter || /^[^:]*/.exec(options.uri)[0];
            if (adapters[adapter] !== undefined) {
                return new(require(adapters[adapter]))(options);
            }
        }
        return new Map();
    }

    static addKeyPrefix(key) {
        if (key === null) return null;
        return this.options.namespace ? `${this.options.namespace}:${key}` : key;
    }

    static removeKeyPrefix(key) {
        if (key === null) return null;
        return this.options.namespace ? key.replace(`${this.options.namespace}:`, '') : key;
    }
}

module.exports = Util;