declare module 'endb' {
  import { EventEmitter } from 'events';
  export const version: string;

  export type EndbOptions = {
    namespace: string;
    serialize: Function;
    deserialize: Function;
    adapter?: string;
    store: any;
    collection?: string | 'endb';
    table?: string | 'endb';
    keySize?: number | 255;
  };

  export class Endb extends EventEmitter {
    public options?: EndbOptions;
    constructor(uri?: string, options?: EndbOptions);
    public all(): Promise<any[]>;
    public clear(): Promise<undefined>;
    public delete(key: string): Promise<true>;
    public async find(fn: Function, thisArg: any): Promise<Object<any> | undefined>;
    public get(key: string): Promise<any>;
    public async has(key: string): Promise<boolean>;
    public async math(key: string, operation: string, operand: number): Promise<true>;
    public static multi(names: string[], options?: EndbOptions): Object<Endb>;
    public set(key: string, value: any): Promise<true>;
  };

  export class Util {
    public static math(base: number, op: string, opand: number): number;
    public static safeRequire(id: string): any | undefined;
  }
}