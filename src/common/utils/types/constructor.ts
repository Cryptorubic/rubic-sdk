import { Tuple } from 'ts-essentials';

export type Constructor<A extends Tuple, R> = new (...args: A) => R;
