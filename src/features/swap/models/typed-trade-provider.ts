import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { TradeType } from '@features/swap/models/trade-type';

export type TypedTradeProviders = Record<TradeType, InstantTradeProvider>;
