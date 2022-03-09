import { InstantTradeProvider } from '@features/instant-trades/instant-trade-provider';
import { TradeType } from '@features/instant-trades/models/trade-type';

export type TypedTradeProviders = Readonly<Record<TradeType, InstantTradeProvider>>;
