import { WrappedCrossChainTradeOrNull } from 'src/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';

export interface WrappedAsyncTradeOrNull {
    total: number;
    calculated: number;
    wrappedTrade: WrappedCrossChainTradeOrNull | WrappedOnChainTradeOrNull;
}
