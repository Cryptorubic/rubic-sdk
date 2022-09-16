import { CrossChainTrade, CrossChainTradeType } from 'src/features';
import { RubicSdkError } from 'src/common';

export type CalculationResult =
    | { trade: CrossChainTrade; error?: RubicSdkError; tradeType?: CrossChainTradeType }
    | { trade: null; error: RubicSdkError; tradeType?: CrossChainTradeType }
    | null;
