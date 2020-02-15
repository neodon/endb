declare module 'endb' {
  import { EventEmitter } from 'events';

  export type EndbOptions = {
    uri?: string;
    namespace?: string;
    serialize?: Function;
    deserialize?: Function;
    adapter?: string;
    store?: any;
    collection?: string;
    table?: string;
    keySize?: number;
  }

  type Element = {
    key: string;
    value?: any;
  }

  export class Endb extends EventEmitter {
    constructor(options?: EndbOptions);
    public options: EndbOptions;
    public all(): Promise<Element[]>;
    public clear(): Promise<undefined>;
    public delete(key: string | string[]): Promise<boolean|boolean[]>;
    public ensure(key: string, value: any): Promise<any>;
    public find(fn: Function, thisArg?: any): Promise<Element | undefined>;
    public get(key: string, path?: string): Promise<any>;
    public has(key: string): Promise<boolean>;
    public keys(): Promise<string[]>;
    public math(key: string, operation: string, operand: number, path?: string): Promise<number>;
    public push(key: string, value: any, path?: string): Promise<any>;
    public remove(key: string, value: any, path?: string): Promise<any>;
    public set(key: string, value: any, path?: string): Promise<true>;
    public values(): Promise<any[]>;
    public static multi(names: string[], options?: EndbOptions): Object<Endb>;
  }

  export class Util {
    public static addKeyPrefix(key: string | string[], namespace: string): string;
    public static isBufferLike(value: any): boolean;
    public static get(object: object, path: string, defaultValue: object): object | undefined;
    public static load(options: EndbOptions): any;
    public static parse(text: string): object;
    public static math(base: number, op: string, opand: number): number;
    public static mergeDefault(def: object, given: object): object;
    public static removeKeyPrefix(key: string, namespace: string): string;
    public static set(object: object, path: string | string[], value: object): object; 
    public static stringify(value: any, space?: string | number): string;
    private static safeRequire(id: string): any | undefined;
    private static validateOptions(options?: EndbOptions): void;
  }
}