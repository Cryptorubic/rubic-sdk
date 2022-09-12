import { MarkRequired } from 'ts-essentials';
import { RpcProvider } from 'src/core/sdk/models/configuration';

export type RpcListProvider = MarkRequired<
    Exclude<RpcProvider, 'mainRpc' | 'spareRpc' | 'healthCheckTimeout'>,
    'rpcList'
>;
