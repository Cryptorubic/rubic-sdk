import { CrossChainTradeType } from 'src/features';
import { CrossChainTradeProvider } from '@features/cross-chain/providers/common/cross-chain-trade-provider';

export type CcrTypedTradeProviders = Readonly<Record<CrossChainTradeType, CrossChainTradeProvider>>;
