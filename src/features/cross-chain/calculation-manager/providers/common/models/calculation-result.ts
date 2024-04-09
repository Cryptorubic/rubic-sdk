import { RubicSdkError } from 'src/common/errors';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

export type CalculationResult<
    T = EvmEncodeConfig | null | TronTransactionConfig | { data: string }
> =
    | { trade: CrossChainTrade<T>; error?: RubicSdkError; tradeType: CrossChainTradeType }
    | { trade: null; error: RubicSdkError; tradeType: CrossChainTradeType };
