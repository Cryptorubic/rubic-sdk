import { RubicSdkError } from 'src/common/errors';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

export type CalculationResult =
    | { trade: CrossChainTrade; error?: RubicSdkError; tradeType: CrossChainTradeType }
    | { trade: null; error: RubicSdkError; tradeType: CrossChainTradeType };
