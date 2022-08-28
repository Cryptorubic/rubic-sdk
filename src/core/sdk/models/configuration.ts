import { HttpClient } from '@rsdk-common/models/http-client';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import Web3 from 'web3';
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
     */
    readonly mainRpc?: string;

    /**
     * Same as `mainRpc`. Will be used instead `mainRpc` if mainRpc is out of timeout = `mainPrcTimeout`.
     */
    readonly spareRpc?: string;

    readonly rpcList?: string[];

    /**
     * Specifies timeout in ms after which `mainRpc` will be replaced with `spareRpc` (if `spareRpc` is defined)
     */
    readonly mainRpcTimeout?: number;

    /**
     * Before the `mainRpc` link is applied to the sdk, all the `mainRpc` links
     * will be health-checked by receiving and verifying the predefined data.
     * If an error occurs during the request the `mainRpc` will be replaced with a spare one.
     * This `healthCheckTimeout` parameter allows you to set the maximum allowable timeout when
     * checking the `mainRpc`.
     */
    readonly healthCheckTimeout?: number;
}

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
export interface WalletProvider {
    /**
     * Core provider.
     */
    readonly core: provider | Web3;

    /**
     * User wallet address.
     */
    readonly address: string;

    /**
     * Selected chain in user wallet.
     */
    readonly chainId: number | string;
}
