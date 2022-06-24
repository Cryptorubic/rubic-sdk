import { CrossChainTrade, CrossChainTradeType } from 'src/features';
import { RubicSdkError } from 'src/common';

export interface WrappedCrossChainTrade {
    /**
     * Calculated cross chain trade.
     * Sometimes trade can be calculated even if error was thrown.
     * Equals `null` in case error is critical and trade cannot be calculated.
     */
    trade: CrossChainTrade | null;

    /**
     * Type of calculated trade.
     */
    tradeType: CrossChainTradeType;

    /**
     * Error, thrown during calculation.
     */
    error?: RubicSdkError;
}
