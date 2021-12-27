import { Tuple } from 'ts-essentials';
export declare type Constructor<A extends Tuple, R> = new (...args: A) => R;
