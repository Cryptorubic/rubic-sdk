import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';

export type CcrTypedTradeProviders = Readonly<Record<CrossChainTradeType, CrossChainTradeProvider>>;
