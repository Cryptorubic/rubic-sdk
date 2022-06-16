import { InstantTradeProvider } from '@rsdk-features/instant-trades/instant-trade-provider';
import { TradeType } from '@rsdk-features/instant-trades/models/trade-type';

export type TypedTradeProviders = Readonly<Record<TradeType, InstantTradeProvider>>;
