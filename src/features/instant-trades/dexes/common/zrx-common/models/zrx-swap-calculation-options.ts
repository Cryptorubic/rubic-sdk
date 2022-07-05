import { SwapCalculationOptions } from '@rsdk-features/instant-trades/models/swap-calculation-options';

export interface ZrxSwapCalculationOptions
    extends Omit<SwapCalculationOptions, 'disableMultihops' | 'deadlineMinutes'> {
    readonly affiliateAddress?: string | null;
}
