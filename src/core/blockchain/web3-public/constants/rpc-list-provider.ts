import { RpcProvider } from 'src/core';
import { MarkRequired } from 'ts-essentials';

export type RpcListProvider = MarkRequired<Exclude<RpcProvider, 'mainRpc' | 'spareRpc'>, 'rpcList'>;
