import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { provider } from 'web3-core';
import Web3 from 'web3';
import { TronWebProvider } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-web-provider';

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

export type EvmWalletProviderCore = WalletProviderCore<provider | Web3>;
export type TronWalletProviderCore = WalletProviderCore<TronWebProvider>;

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
export interface WalletProvider {
    readonly [CHAIN_TYPE.EVM]?: EvmWalletProviderCore;
    readonly [CHAIN_TYPE.TRON]?: TronWalletProviderCore;
}
