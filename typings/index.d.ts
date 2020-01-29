declare module 'endb' {
  import { EventEmitter } from 'events';

  interface EndbOptions {
    namespace: string;
    serialize: Function;
    deserialize: Function;
    adapter: string;
    store: any;
    collection: string;
    table: string;
    keySize: number;
  }

  interface Element {
    key: string;
    value: any;
  }

  export class Endb extends EventEmitter {
    public options?: EndbOptions;
    constructor(uri?: string, options?: EndbOptions);
    public all(): Promise<Element[]>;
    public clear(): Promise<undefined>;
    public delete(key: string | string[]): Promise<boolean|boolean[]>;
    public ensure(key: string, value: any): Promise<any>;
    public find(fn: Function, thisArg?: any): Promise<Element | undefined>;
    public get(key: string, path?: string): Promise<any>;
    public has(key: string): Promise<boolean>;
    public keys(): Promise<string[]>;
    public math(key: string, operation: string, operand: number, path?: string): Promise<true>;
    public static multi(names: string[], options?: EndbOptions): Object<Endb>;
    public push(key: string, value: any, allowDupes?: boolean): Promise<true>;
    public remove(key: string, value: any): Promise<true>;
    public set(key: string, value: any, path?: null): Promise<true>;
    public values(): Promise<any[]>
  }

  export class Util {
    public static addKeyPrefix(key: string | string[], namespace: string): string;
    public static isBufferLike(x: any): boolean;
    public static get(object: object, path: string, defaultValue: object): object | undefined;
    public static isObject(x: any): boolean;
    public static load(options: EndbOptions): any;
    public static parse(text: string): object;
    public static math(base: number, op: string, opand: number): number;
    public static removeKeyPrefix(key: string, namespace: string): string;
    public static safeRequire(id: string): any | undefined;
    public static set(object: object, path: string | string[], value: object): object; 
    public static stringify(value: any, space?: string | number): string;
  }
}