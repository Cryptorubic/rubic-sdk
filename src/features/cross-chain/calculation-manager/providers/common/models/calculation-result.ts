import { RubicSdkError } from 'src/common/errors';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

export type CalculationResult<
    T =
        | EvmEncodeConfig
        | null
        | TronTransactionConfig
        | { data: string }
        | TonEncodedConfig
        | BitcoinEncodedConfig
> =
    | { trade: CrossChainTrade<T>; error?: RubicSdkError; tradeType: CrossChainTradeType }
    | { trade: null; error: RubicSdkError; tradeType: CrossChainTradeType };
