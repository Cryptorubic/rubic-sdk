import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';

export interface ZrxSwapCalculationOptions
    extends Omit<SwapCalculationOptions, 'disableMultihops' | 'deadlineMinutes'> {
    readonly affiliateAddress?: string | null;
}
