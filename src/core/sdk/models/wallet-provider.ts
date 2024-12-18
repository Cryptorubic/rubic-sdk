import { TonConnectUI } from '@tonconnect/ui';
import { Any } from 'src/common/utils/types';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { SolanaWeb3 } from 'src/core/sdk/models/solana-web3';
import { TronWeb } from 'tronweb';
import Web3 from 'web3';
import { provider } from 'web3-core';

export interface WalletProviderCore<T = Any> {
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
export type TronWalletProviderCore = WalletProviderCore<TronWeb>;
export type SolanaWalletProviderCore = WalletProviderCore<SolanaWeb3>;
export type TonWalletProviderCore = WalletProviderCore<TonConnectUI>;

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
interface IWalletProvider {
    readonly [CHAIN_TYPE.EVM]?: EvmWalletProviderCore;
    readonly [CHAIN_TYPE.TRON]?: TronWalletProviderCore;
    readonly [CHAIN_TYPE.SOLANA]?: SolanaWalletProviderCore;
    readonly [CHAIN_TYPE.TON]?: TonWalletProviderCore;
}

export type WalletProvider = Partial<IWalletProvider>;
