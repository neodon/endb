declare module 'endb' {
	import {EventEmitter} from 'events';

	type MaybePromise<T> = T | Promise<T>;

	export interface EndbAdapter {
		namespace: string;
		on?(event: 'error', callback: (error: Error) => void | never): void;
		all(): MaybePromise<{ key: string; value: any }[]>;
		clear(): MaybePromise<void>;
		delete(key: string): MaybePromise<boolean>;
		get(key: string): MaybePromise<void | any>;
		set(key: string, value: any): MaybePromise<unknown>;
	}

	export interface EndbOptions {
		uri?: string;
		namespace: string;
		adapter?: string;
		store: EndbAdapter;
		collection?: string;
		table?: string;
		keySize?: number;
		serialize(x: any): any;
		deserialize(x: any): any;
	}

	export function safeRequire(name: string): any;

	export class Endb extends EventEmitter {
		public options: EndbOptions;
		constructor(options?: string | EndbOptions);
		public static multi(
			names: string[],
			options?: EndbOptions
		): { [name: string]: Endb }[];
		public all(): Promise<{ key: string; value: any; }[]>;
		public clear(): Promise<void>;
		public delete(key: string | string[]): Promise<boolean>;
		public ensure(key: string, value: any): Promise<void | any>;
		public entries(): Promise<any[][]>;
		public find(fn: (value: any, key: string) => any, thisArg?: any): Promise<{ key: string; value: any; } | void>;
		public get(key: string, path?: string): Promise<any | void>;
		public has(key: string): Promise<boolean>;
		public keys(): Promise<string[][]>;
		public math(
			key: string,
			operation: string,
			operand: number,
			path?: string
		): Promise<boolean>;
		public push(
			key: string,
			value: any,
			path?: string,
			allowDuplicates?: boolean
		): Promise<any>;
		public remove(key: string, value: any, path?: string): Promise<any>;
		public set(key: string, value: any, path?: string): Promise<boolean>;
		public values(): Promise<any[][]>;
	}
}
