import { HttpClient } from '@rsdk-common/models/http-client';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import Web3 from 'web3';
import { provider } from 'web3-core';

export interface Configuration {
    readonly rpcProviders: Partial<Record<BlockchainName, RpcProvider>>;
    readonly walletProvider?: WalletProvider;
    readonly httpClient?: HttpClient;
    readonly providerAddress?: string;
}

export interface RpcProvider {
    readonly mainRpc: string;
    readonly spareRpc?: string;
    readonly mainRpcTimeout?: number;
    readonly healthCheckTimeout?: number;
}

export interface WalletProvider {
    readonly core: provider | Web3;
    readonly address: string;
    readonly chainId: number | string;
}
