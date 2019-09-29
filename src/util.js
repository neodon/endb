'use strict';

class Util {

    static addKeyPrefix({ key, namespace }) {
        if (key === null) return null;
        return namespace ? `${namespace}:${key}` : key;
    }

    static colorize(content) {
        const colors = {
            black: `\x1b[30m${content}\x1b[0m`,
            red: `\x1b[31m${content}\x1b[0m`,
            green: `\x1b[32m${content}\x1b[0m`,
            yellow: `\x1b[33m${content}\x1b[0m`,
            blue: `\x1b[34m${content}\x1b[0m`,
            magenta: `\x1b[35m${content}\x1b[0m`,
            cyan: `\x1b[36m${content}\x1b[0m`,
            white: `\x1b[37m${content}\x1b[0m`,
            bgBlack: `\x1b[40m${content}\x1b[0m`,
            bgRed: `\x1b[41m${content}\x1b[0m`,
            bgGreen: `\x1b[42m${content}\x1b[0m`,
            bgYellow: `\x1b[43m${content}\x1b[0m`,
            bgBlue: `\x1b[44m${content}\x1b[0m`,
            bgMagenta: `\x1b[45m${content}\x1b[0m`,
            bgCyan: `\x1b[46m${content}\x1b[0m`,
            bgWhite: `\x1b[47m${content}\x1b[0m`
        };
        return colors;
    }

    static isBufferLike(x) {
        return (typeof x === 'object' && x !== null && x.type === 'Buffer' && (Array.isArray(x.data) || typeof x.data === 'string'));
    }


    static load(options) {
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

    static mapObject(arr, fn) {
        return (a => ((a = [arr, arr.map(fn)]), a[0].reduce((acc, val, ind) => ((acc[val] = a[1][ind]), acc), {})))();
    }

    static math(base, op, opand) {
        if (base == undefined || op == undefined || opand == undefined)
            throw new Error('Missing required parameters.');
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
                return Math.pow(base, opand);
            case 'mod':
            case 'modulo':
            case '%':
                return base % opand;
        }
        return null;
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

    static removeKeyPrefix({ key, namespace }) {
        if (key === null) return null;
        return namespace ? key.replace(`${namespace}:`, '') : key;
    }

    static rowsToObject(rows) {
        const obj = {};
        for (const i in rows) {
            const row = rows[i];
            obj[Util.removeKeyPrefix({ key: row.key, namespace: this.options.namespace })] = Util.parse(row.value).value;
        }
        return obj;
    }

    static safeRequire(id) {
        try {
            return require(id);
        } catch (err) {
            console.error(Util.colorize(`Install ${id} to continue; run "npm install ${id}" to install it.`).cyan);
            return false;
        }
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
}

module.exports = Util;