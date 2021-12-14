import { InstantTrade } from '@features/swap/instant-trade';
import { TradeType } from '@features/swap/models/trade-type';

export type TypedTrade = {
    type: TradeType;
    trade: InstantTrade;
};
