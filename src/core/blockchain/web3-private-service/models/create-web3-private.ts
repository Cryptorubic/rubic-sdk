import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PrivateSupportedChainType } from 'src/core/blockchain/web3-private-service/models/web-private-supported-chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { SolanaWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/solana-web3-private';
import { SuiWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/sui-web3-private/sui-web3-private';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import {
    EvmWalletProviderCore,
    SolanaWalletProviderCore,
    SuiWalletProviderCore,
    TonWalletProviderCore,
    TronWalletProviderCore,
    WalletProviderCore
} from 'src/core/sdk/models/wallet-provider';

import { TonWeb3Private } from '../web3-private/ton-web3-private/ton-web3-private';

export type CreateWeb3Private = Record<
    Web3PrivateSupportedChainType,
    (walletProviderCore: WalletProviderCore) => Web3Private
> & {
    [CHAIN_TYPE.EVM]: (walletProviderCore: EvmWalletProviderCore) => EvmWeb3Private;
    [CHAIN_TYPE.TRON]: (walletProviderCore: TronWalletProviderCore) => TronWeb3Private;
    [CHAIN_TYPE.SOLANA]: (walletProviderCore: SolanaWalletProviderCore) => SolanaWeb3Private;
    [CHAIN_TYPE.TON]: (walletProviderCore: TonWalletProviderCore) => TonWeb3Private;
    [CHAIN_TYPE.SUI]: (walletProviderCore: SuiWalletProviderCore) => SuiWeb3Private;
};
