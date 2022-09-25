import { TradeType } from 'src/features/instant-trades/providers/models/trade-type';

export interface InstantTradeError {
    type: TradeType;
    error: Error;
}
