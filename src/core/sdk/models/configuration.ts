import { HttpClient } from '@common/models/http-client';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import Web3 from 'web3';
import { provider } from 'web3-core';

export interface Configuration {
    readonly walletProvider?: WalletProvider;
    readonly rpcProviders: Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>;
    readonly httpClient?: HttpClient;
}

export interface RpcProvider {
    mainRpc: string;
    spareRpc?: string;
    mainPrcTimeout?: number;
    healthCheckTimeout?: number;
}

export interface WalletProvider {
    core: provider | Web3;
    address: string;
    chainId: number | string;
}
