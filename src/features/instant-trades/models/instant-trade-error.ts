import { TradeType } from 'src/features';

export interface InstantTradeError {
    type: TradeType;
    error: Error;
}
