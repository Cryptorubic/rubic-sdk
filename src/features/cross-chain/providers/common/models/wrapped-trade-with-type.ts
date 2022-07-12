import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';

export type WrappedTradeWithType = Omit<WrappedCrossChainTrade, 'tradeType'> | null;
