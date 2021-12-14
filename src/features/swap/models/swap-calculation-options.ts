import { SwapOptions } from '@features/swap/models/swap-options';

export interface SwapCalculationOptions extends SwapOptions {
    readonly gasCalculation?: 'disabled' | 'calculate' | 'rubicOptimisation';
    readonly disableMultihops?: boolean;
}
