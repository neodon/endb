declare module 'endb' {
  import { EventEmitter } from 'events';
  export const version: string;

  type EndbOptions = {
    namespace: string | 'endb';
    serialize: Function;
    deserialize: Function;
    adapter: 'level' | 'leveldb' | 'mongo' | 'mongodb' | 'mysql' | 'mysql2' | 'postgres' | 'postgresql' | 'redis' | 'sqlite' | 'sqlite3';
    store: any;
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
    public delete(key: string): Promise<true>;
    public find(fn: Function, thisArg: any): Promise<Element | undefined>;
    public get(key: string): Promise<any>;
    public has(key: string): Promise<boolean>;
    public math(key: string, operation: string, operand: number): Promise<true>;
    public static multi(names: string[], options: EndbOptions): any;
    public set(key: string, value: any): Promise<true>;
  }

  export class Util {
    public static math(base: number, op: string, opand: number): number;
    public static safeRequire(id: string): any | undefined;
  }
}