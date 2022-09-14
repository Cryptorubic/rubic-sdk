import { TradeType } from 'src/features/instant-trades/models/trade-type';
import { SwapCalculationOptions } from 'src/features/instant-trades/models/swap-calculation-options';

export interface SwapManagerCalculationOptions extends SwapCalculationOptions {
    readonly timeout?: number;
    readonly disabledProviders?: TradeType[];
}
