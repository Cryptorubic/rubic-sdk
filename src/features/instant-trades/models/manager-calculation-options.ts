import { TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';

export interface ManagerCalculationOptions extends CalculationOptions {
    readonly timeout?: number;
    readonly disabledProviders?: TradeType[];
}
