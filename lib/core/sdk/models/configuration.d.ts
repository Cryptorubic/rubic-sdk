import { HttpClient } from '../../../common/models/http-client';
import { BLOCKCHAIN_NAME } from '../../blockchain/models/BLOCKCHAIN_NAME';
import Web3 from 'web3';
import { provider } from 'web3-core';
export interface Configuration {
    readonly rpcProviders: Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>;
    readonly walletProvider?: WalletProvider;
    readonly httpClient?: HttpClient;
}
export interface RpcProvider {
    readonly mainRpc: string;
    readonly spareRpc?: string;
    readonly mainPrcTimeout?: number;
    readonly healthCheckTimeout?: number;
}
export interface WalletProvider {
    readonly core: provider | Web3;
    readonly address: string;
    readonly chainId: number | string;
}
