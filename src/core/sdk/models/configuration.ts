import { HttpClient } from '@common/models/http-client';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { provider } from 'web3-core';

export interface Configuration {
    readonly walletProvider: provider;
    readonly rpcProviders: Record<BLOCKCHAIN_NAME, RpcProvider>;
    readonly httpClient?: HttpClient;
}

export interface RpcProvider {
    mainRpc: string;
    spareRpc?: string;
    mainPrcTimeout?: number;
    healthCheckTimeout?: number;
}
