import { RubicSdkError } from 'src/common/errors';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';

export type CalculationResult =
    | { trade: CrossChainTrade; error?: RubicSdkError; tradeType?: CrossChainTradeType }
    | { trade: null; error: RubicSdkError; tradeType?: CrossChainTradeType }
    | null;
