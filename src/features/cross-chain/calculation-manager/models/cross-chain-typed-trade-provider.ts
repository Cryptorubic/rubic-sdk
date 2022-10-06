import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';

export type CrossChainTypedTradeProviders = Readonly<
    Record<CrossChainTradeType, CrossChainProvider>
>;
