declare module 'endb' {
  import { EventEmitter } from 'events';

  type EndbOptions = {
    namespace: string | 'endb';
    serialize: Function;
    deserialize: Function;
    adapter: 'level' | 'leveldb' | 'mongo' | 'mongodb' | 'mysql' | 'mysql2' | 'postgres' | 'postgresql' | 'redis' | 'sqlite' | 'sqlite3';
    store: any | Map;
    collection: string | 'endb';
    table: string | 'endb';
    keySize: number | 255;
  }

  interface Element {
    key: string;
    value: any;
  }

  export class Endb extends EventEmitter {
    public options: EndbOptions;
    constructor(uri: string, options: EndbOptions);
    public all(): Promise<Element[]>;
    public clear(): Promise<undefined>;
    public delete(key: string): Promise<boolean>;
    public find(fn: Function, thisArg: any): Promise<Element | undefined>;
    public get(key: string): Promise<any>;
    public has(key: string): Promise<boolean>;
    public math(key: string, operation: string, operand: number): Promise<true>;
    public static multi(names: string[], options: EndbOptions): any;
    public set(key: string, value: any): Promise<true>;
  }

  class Util {
    public static addKeyPrefix(key: string, namespace: string): string;
    public static isBufferLike(x: any): boolean;
    public static isObject(x: any): boolean;
    public static load(options: EndbOptions): any;
    public static parse(text: string): any;
    public static math(base: number, op: string, opand: number): number;
    public static removeKeyPrefix(key: string, namespace: string): string;
    public static safeRequire(id: string): any | undefined;
    public static stringify(value: any, space?: string | number): string;
  }
}