import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { TradeType } from '@features/swap/models/trade-type';
export interface SwapManagerCalculationOptions extends SwapCalculationOptions {
    readonly timeout?: number;
    readonly disabledProviders?: TradeType[];
}
