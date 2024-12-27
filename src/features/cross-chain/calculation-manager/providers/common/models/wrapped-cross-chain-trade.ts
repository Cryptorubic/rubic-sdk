import { RubicSdkError } from 'src/common/errors';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

export interface WrappedCrossChainTrade {
    /**
     * Calculated cross-chain trade.
     * Sometimes trade can be calculated even if error was thrown.
     * Equals `null` in case error is critical and trade cannot be calculated.
     */
    trade: CrossChainTrade<unknown> | null;

    /**
     * Type of calculated trade.
     */
    tradeType: Exclude<CrossChainTradeType, 'multichain'>;

    /**
     * Error, thrown during calculation.
     */
    error?: RubicSdkError;
}
