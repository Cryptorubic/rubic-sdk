import { CrossChainTrade, CrossChainTradeType } from 'src/features';
import { RubicSdkError } from 'src/common';

export interface WrappedCrossChainTrade {
    trade: CrossChainTrade | null;
    tradeType: CrossChainTradeType;
    error?: RubicSdkError;
}
