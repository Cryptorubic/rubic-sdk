import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import Web3 from 'web3';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { provider } from 'web3-core';

/**
 * Main sdk configuration.
 */
export interface Configuration {
    /**
     * Rpc data to connect to blockchains you will use.
     * You have to pass rpcProvider for each blockchain you will use with sdk.
     */
    readonly rpcProviders: Partial<Record<BlockchainName, RpcProvider>>;

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
 * Stores information about rpc in certain blockchain.
 */
export interface RpcProvider {
    /**
     * Rpc link. Copy it from your rpc provider (like Infura, Quicknode, Getblock, Moralis, etc.) website.
     * @deprecated
     */
    readonly mainRpc?: string;

    /**
     * Same as `mainRpc`. Will be used instead `mainRpc` if mainRpc is out of timeout = `mainPrcTimeout`.
     * @deprecated
     */
    readonly spareRpc?: string;

    /**
     * Contains rpc links in order of prioritization. Used instead of deprecated `mainRpc` and `spareRpc` fields.
     */
    readonly rpcList?: string[];

    /**
     * Specifies timeout in ms after which `mainRpc` will be replaced with `spareRpc` (if `spareRpc` is defined)
     */
    readonly mainRpcTimeout?: number;
}

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
export interface WalletProvider {
    readonly [CHAIN_TYPE.EVM]?: WalletProviderCore;
}

export interface WalletProviderCore {
    /**
     * Core provider.
     */
    readonly core: provider | Web3;

    /**
     * User wallet address.
     */
    readonly address: string;
}
