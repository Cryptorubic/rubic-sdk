import { SwapCalculationOptions } from './swap-calculation-options';
import { TradeType } from './trade-type';
export interface SwapManagerCalculationOptions extends SwapCalculationOptions {
    readonly timeout?: number;
    readonly disabledProviders?: TradeType[];
}
