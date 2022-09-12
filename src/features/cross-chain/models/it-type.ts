import { TradeType } from 'src/features/instant-trades/models/trade-type';

export interface ItType {
    from: TradeType | undefined;
    to: TradeType | undefined;
}
