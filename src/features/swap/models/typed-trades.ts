import { InstantTrade } from '@features/swap/instant-trade';
import { TradeType } from '@features/swap/models/trade-type';

export type TypedTrades = Partial<Record<TradeType, InstantTrade>>;
