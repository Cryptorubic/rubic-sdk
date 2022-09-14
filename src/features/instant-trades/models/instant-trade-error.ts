import { TradeType } from 'src/features/instant-trades/models/trade-type';

export interface InstantTradeError {
    type: TradeType;
    error: Error;
}
