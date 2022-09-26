import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/providers/common/cross-chain-provider';

export type CrossChainTypedTradeProviders = Readonly<
    Record<CrossChainTradeType, CrossChainProvider>
>;
