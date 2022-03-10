import { SwapCalculationOptions } from '@features/instant-trades/models/swap-calculation-options';
import { TradeType } from '@features/instant-trades/models/trade-type';

export interface SwapManagerCalculationOptions extends SwapCalculationOptions {
    readonly timeout?: number;
    readonly disabledProviders?: TradeType[];
}
