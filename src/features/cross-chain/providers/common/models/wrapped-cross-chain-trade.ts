import { RubicSdkError } from 'src/common/errors';
import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';

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
