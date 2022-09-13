import Web3 from 'web3';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { provider } from 'web3-core';
import { TronWebProvider } from 'src/core/blockchain/web3-public-service/models/tron-web-provider';
import { RpcProviders } from 'src/core/sdk/models/rpc-provider';

/**
 * Main sdk configuration.
 */
export interface Configuration {
    /**
     * Rpc data to connect to blockchains you will use.
     * You have to pass rpcProvider for each blockchain you will use with sdk.
     */
    readonly rpcProviders: RpcProviders;

    /**
     * Required to use `swap`, `approve` and other methods which sends transactions.
     * But you can calculate and encode trades without `walletProvider`.
     * Pass it when user connects wallet. Please note that `address` and `chainId` must
     * match account address and selected chain id in a user's wallet.
     */
    readonly walletProvider?: WalletProvider;

    /**
     * You can pass your own http client (e.g. HttpClient in Angular) if you have it,
     * to not duplicate http clients and decrease bundle size.
     */
    readonly httpClient?: HttpClient;

    /**
     * Integrator wallet address.
     */
    readonly providerAddress?: string;
}

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
export interface WalletProvider {
    readonly [CHAIN_TYPE.EVM]?: WalletProviderCore<provider | Web3>;
    readonly [CHAIN_TYPE.TRON]?: WalletProviderCore<TronWebProvider>;
}

export interface WalletProviderCore<T> {
    /**
     * Core provider.
     */
    readonly core: T;

    /**
     * User wallet address.
     */
    readonly address: string;
}
