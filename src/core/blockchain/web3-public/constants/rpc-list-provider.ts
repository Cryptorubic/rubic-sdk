import { RpcProvider } from 'src/core';

export type RpcListProvider = Exclude<RpcProvider, 'mainRpc' | 'spareRpc'>;
